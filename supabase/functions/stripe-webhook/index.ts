import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${d}`);
};

serve(async (req) => {
  // Webhooks are POST only
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    logStep("ERROR", { message: "Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET" });
    return new Response("Server configuration error", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  // Verify webhook signature
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    logStep("ERROR", { message: "No stripe-signature header" });
    return new Response("No signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logStep("Signature verification failed", { message: msg });
    return new Response(`Webhook signature verification failed: ${msg}`, { status: 400 });
  }

  logStep("Event received", { type: event.type, id: event.id });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(stripe, supabase, session);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabase, subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(supabase, invoice);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(supabase, invoice);
        break;
      }
      default:
        logStep("Unhandled event type", { type: event.type });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logStep("Error processing event", { type: event.type, message: msg });
    return new Response(`Error processing webhook: ${msg}`, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

// --- Event Handlers ---

async function handleCheckoutCompleted(
  stripe: Stripe,
  supabase: any,
  session: Stripe.Checkout.Session
) {
  logStep("Checkout completed", { sessionId: session.id, customerId: session.customer });

  if (session.mode !== "subscription") {
    logStep("Not a subscription checkout, skipping");
    return;
  }

  const customerEmail = session.customer_details?.email || session.customer_email;
  if (!customerEmail) {
    logStep("No customer email found in session");
    return;
  }

  // Find the Supabase user by email
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    logStep("Error listing users", { error: userError.message });
    return;
  }
  const user = users.users.find((u: any) => u.email === customerEmail);
  if (!user) {
    logStep("No Supabase user found for email", { email: customerEmail });
    return;
  }

  // Fetch the full subscription from Stripe
  const subscriptionId = session.subscription as string;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const productId = subscription.items.data[0]?.price?.product as string;
  const priceId = subscription.items.data[0]?.price?.id;

  // Upsert subscription in our database
  const { error: upsertError } = await supabase
    .from("subscriptions")
    .upsert({
      user_id: user.id,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionId,
      product_id: productId,
      price_id: priceId,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    }, { onConflict: "stripe_subscription_id" });

  if (upsertError) {
    logStep("Error upserting subscription", { error: upsertError.message });
    throw upsertError;
  }

  // Assign organizer role if not already present
  const { data: existingRoles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const hasOrganizer = existingRoles?.some((r: any) => r.role === "organizer");
  if (!hasOrganizer) {
    await supabase.from("user_roles").insert({ user_id: user.id, role: "organizer" });
    logStep("Assigned organizer role to user", { userId: user.id });
  }

  // Send in-app notification
  await supabase.from("user_notifications").insert({
    user_id: user.id,
    title: "Subskrypcja aktywowana! 🎉",
    message: `Twoja subskrypcja została pomyślnie aktywowana. Dziękujemy za zaufanie!`,
    type: "success",
    action_url: "/dashboard",
  });

  logStep("Subscription provisioned successfully", { userId: user.id, productId });
}

async function handleSubscriptionUpdated(supabase: any, subscription: Stripe.Subscription) {
  logStep("Subscription updated", { subId: subscription.id, status: subscription.status });

  const productId = subscription.items.data[0]?.price?.product as string;
  const priceId = subscription.items.data[0]?.price?.id;

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: subscription.status,
      product_id: productId,
      price_id: priceId,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    logStep("Error updating subscription", { error: error.message });
    throw error;
  }
}

async function handleSubscriptionDeleted(supabase: any, subscription: Stripe.Subscription) {
  logStep("Subscription deleted", { subId: subscription.id });

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    logStep("Error deleting subscription", { error: error.message });
    throw error;
  }

  // Notify user
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (sub?.user_id) {
    await supabase.from("user_notifications").insert({
      user_id: sub.user_id,
      title: "Subskrypcja anulowana",
      message: "Twoja subskrypcja została anulowana. Możesz ją odnowić w każdej chwili.",
      type: "warning",
      action_url: "/products",
    });
  }
}

async function handleInvoicePaymentSucceeded(supabase: any, invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;
  logStep("Invoice payment succeeded", { invoiceId: invoice.id, subId: invoice.subscription });

  // Update period dates from the invoice
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "active",
      current_period_start: invoice.period_start
        ? new Date(invoice.period_start * 1000).toISOString()
        : undefined,
      current_period_end: invoice.period_end
        ? new Date(invoice.period_end * 1000).toISOString()
        : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", invoice.subscription as string);

  if (error) {
    logStep("Error updating subscription from invoice", { error: error.message });
  }
}

async function handleInvoicePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;
  logStep("Invoice payment failed", { invoiceId: invoice.id, subId: invoice.subscription });

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", invoice.subscription as string)
    .single();

  if (sub?.user_id) {
    await supabase
      .from("subscriptions")
      .update({ status: "past_due", updated_at: new Date().toISOString() })
      .eq("stripe_subscription_id", invoice.subscription as string);

    await supabase.from("user_notifications").insert({
      user_id: sub.user_id,
      title: "Płatność nieudana ⚠️",
      message: "Nie udało się pobrać płatności za subskrypcję. Zaktualizuj metodę płatności.",
      type: "error",
      action_url: "/settings",
    });
  }
}
