
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "npm:resend@2.0.0";
import { 
  checkRateLimit, 
  getClientIP, 
  createRateLimitResponse,
} from "../_shared/rateLimiter.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { getAuthenticatedUser, hasAllowedRole } from "../_shared/auth.ts";

const corsHeaders = buildCorsHeaders();
const MAX_BATCH_SIZE = 100;

// Rate limit: 10 requests per minute per IP
const RATE_LIMIT_CONFIG = {
  maxRequests: 10,
  windowMs: 60 * 1000,
  keyPrefix: 'send-invitation-emails',
};

interface SendInvitationRequest {
  campaignId: string;
  batchSize?: number;
}

function jsonResponse(body: unknown, status: number, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders, ...headers },
  });
}

function clampBatchSize(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return 50;
  return Math.min(Math.max(Math.floor(parsed), 1), MAX_BATCH_SIZE);
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting check
  const clientIP = getClientIP(req);
  const rateLimitResult = checkRateLimit(clientIP, RATE_LIMIT_CONFIG);
  
  if (!rateLimitResult.allowed) {
    console.warn(`Rate limit exceeded for IP: ${clientIP}`);
    return createRateLimitResponse(rateLimitResult, corsHeaders);
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return jsonResponse({ error: 'Unauthorized - invalid token' }, 401);

    const userId = user.id;
    console.log(`Authenticated user: ${userId}`);

    // Use service role client for database operations
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const { campaignId, batchSize }: SendInvitationRequest = await req.json();
    const safeBatchSize = clampBatchSize(batchSize);

    if (!campaignId) {
      return jsonResponse({ error: 'Campaign ID is required' }, 400);
    }

    console.log(`Processing campaign: ${campaignId}, batch size: ${safeBatchSize}`);

    // Authorization check: Verify user owns the campaign's event
    const { data: campaign, error: campaignError } = await serviceClient
      .from('email_campaigns')
      .select('event_id')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error('Campaign not found:', campaignError);
      return jsonResponse({ error: 'Campaign not found' }, 404);
    }

    const { data: event, error: eventError } = await serviceClient
      .from('events')
      .select('organizer_id')
      .eq('id', campaign.event_id)
      .single();

    if (eventError || !event) {
      console.error('Event not found:', eventError);
      return jsonResponse({ error: 'Event not found' }, 404);
    }

    // Check if user is the event organizer or an admin
    const isAdmin = await hasAllowedRole(serviceClient, userId, ["admin"]);
    const isOrganizer = event.organizer_id === userId;

    if (!isOrganizer && !isAdmin) {
      console.warn(`User ${userId} attempted to access campaign ${campaignId} without authorization`);
      return jsonResponse({ error: 'Forbidden - not event organizer or admin' }, 403);
    }

    console.log(`Authorization passed for user ${userId} (organizer: ${isOrganizer}, admin: ${isAdmin})`);

    // Get pending emails for this campaign
    const { data: pendingEmails, error: queueError } = await serviceClient
      .from('email_queue')
      .select(`
        *,
        invitation:invitations!inner(
          *,
          guest:guests(*),
          event:events(*)
        )
      `)
      .eq('status', 'pending')
      .eq('invitation.event_id', campaign.event_id)
      .limit(safeBatchSize);

    if (queueError) {
      throw new Error(`Queue error: ${queueError.message}`);
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return jsonResponse({ message: "No pending emails found" }, 200);
    }

    console.log(`Found ${pendingEmails.length} pending emails`);

    let sentCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    // Process emails in batch
    for (const emailItem of pendingEmails) {
      try {
        if (emailItem.invitation?.event?.id !== campaign.event_id) {
          skippedCount++;
          console.warn(`Skipping email ${emailItem.id}: queue item does not belong to campaign event ${campaign.event_id}`);
          continue;
        }

        const invitation = emailItem.invitation;
        const eventTitle = escapeHtml(invitation.event.title);
        const eventDate = new Date(invitation.event.start_date).toLocaleDateString('pl-PL');
        const eventLocation = escapeHtml(invitation.event.location || 'Do ustalenia');
        const eventDescription = escapeHtml(invitation.event.description || '');
        const guestName = `${escapeHtml(invitation.guest.first_name)} ${escapeHtml(invitation.guest.last_name)}`.trim();
        const qrCodeData = escapeHtml(invitation.qr_code_data);

        // Update status to sending
        await serviceClient
          .from('email_queue')
          .update({ status: 'sending' })
          .eq('id', emailItem.id);

        // Create invitation HTML with QR code
        const invitationHtml = `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h1 style="color: #333; text-align: center;">Zaproszenie na ${eventTitle}</h1>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2>Drogi ${guestName},</h2>
              <p>Zapraszamy Cię na wydarzenie:</p>
              
              <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h3 style="margin: 0; color: #007bff;">${eventTitle}</h3>
                <p style="margin: 5px 0;"><strong>Data:</strong> ${eventDate}</p>
                <p style="margin: 5px 0;"><strong>Lokalizacja:</strong> ${eventLocation}</p>
                ${eventDescription ? `<p style="margin: 5px 0;"><strong>Opis:</strong> ${eventDescription}</p>` : ''}
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <h3>Twój kod QR:</h3>
                <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block;">
                  <div id="qr-code" style="font-family: monospace; font-size: 12px; word-break: break-all; max-width: 200px;">
                    ${qrCodeData}
                  </div>
                </div>
                <p style="font-size: 14px; color: #666; margin-top: 10px;">
                  Pokaż ten kod przy wejściu na wydarzenie
                </p>
              </div>
              
              <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px;">
                  <strong>Ważne:</strong> To zaproszenie jest personalne i nie może być przekazywane innym osobom.
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #666;">
                Wiadomość wygenerowana automatycznie przez system zarządzania wydarzeniami
              </p>
            </div>
          </div>
        `;

        // Send email via Resend
        const emailResult = await resend.emails.send({
          from: "Zaproszenia <onboarding@resend.dev>",
          to: [emailItem.recipient_email],
          subject: emailItem.subject,
          html: invitationHtml,
        });

        if (emailResult.error) {
          throw new Error(emailResult.error.message);
        }

        // Update email status to sent
        await serviceClient
          .from('email_queue')
          .update({ 
            status: 'sent',
            last_attempt_at: new Date().toISOString()
          })
          .eq('id', emailItem.id);

        // Update invitation sent_at timestamp
        await serviceClient
          .from('invitations')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', invitation.id)
          .eq('event_id', campaign.event_id);

        sentCount++;
        console.log(`Email sent to: ${emailItem.recipient_email}`);

      } catch (emailError) {
        console.error(`Failed to send email to ${emailItem.recipient_email}:`, emailError);
        
        // Update email status to failed
        await serviceClient
          .from('email_queue')
          .update({ 
            status: 'failed',
            error_message: emailError.message,
            last_attempt_at: new Date().toISOString()
          })
          .eq('id', emailItem.id);

        failedCount++;
      }

      // Small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Update campaign statistics
    if (campaignId) {
      const { data: campaign } = await serviceClient
        .from('email_campaigns')
        .select('sent_count, failed_count')
        .eq('id', campaignId)
        .single();

      if (campaign) {
        await serviceClient
          .from('email_campaigns')
          .update({
            sent_count: (campaign.sent_count || 0) + sentCount,
            failed_count: (campaign.failed_count || 0) + failedCount,
          })
          .eq('id', campaignId);
      }
    }

    return jsonResponse(
      {
        success: true,
        processed: pendingEmails.length,
        sent: sentCount,
        failed: failedCount,
        skipped: skippedCount,
      },
      200,
    );

  } catch (error) {
    console.error("Error in send-invitation-emails function:", error);
    return jsonResponse({ error: error.message }, 500);
  }
};

serve(handler);
