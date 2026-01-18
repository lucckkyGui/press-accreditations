
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendInvitationRequest {
  campaignId: string;
  batchSize?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - missing token' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the token and get user claims
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('Token validation failed:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`Authenticated user: ${userId}`);

    // Use service role client for database operations
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const { campaignId, batchSize = 50 }: SendInvitationRequest = await req.json();

    console.log(`Processing campaign: ${campaignId}, batch size: ${batchSize}`);

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
      .limit(batchSize);

    if (queueError) {
      throw new Error(`Queue error: ${queueError.message}`);
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending emails found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${pendingEmails.length} pending emails`);

    let sentCount = 0;
    let failedCount = 0;

    // Process emails in batch
    for (const emailItem of pendingEmails) {
      try {
        // Update status to sending
        await serviceClient
          .from('email_queue')
          .update({ status: 'sending' })
          .eq('id', emailItem.id);

        // Create invitation HTML with QR code
        const invitationHtml = `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h1 style="color: #333; text-align: center;">Zaproszenie na ${emailItem.invitation.event.title}</h1>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2>Drogi ${emailItem.invitation.guest.first_name} ${emailItem.invitation.guest.last_name},</h2>
              <p>Zapraszamy Cię na wydarzenie:</p>
              
              <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h3 style="margin: 0; color: #007bff;">${emailItem.invitation.event.title}</h3>
                <p style="margin: 5px 0;"><strong>Data:</strong> ${new Date(emailItem.invitation.event.start_date).toLocaleDateString('pl-PL')}</p>
                <p style="margin: 5px 0;"><strong>Lokalizacja:</strong> ${emailItem.invitation.event.location || 'Do ustalenia'}</p>
                ${emailItem.invitation.event.description ? `<p style="margin: 5px 0;"><strong>Opis:</strong> ${emailItem.invitation.event.description}</p>` : ''}
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <h3>Twój kod QR:</h3>
                <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block;">
                  <div id="qr-code" style="font-family: monospace; font-size: 12px; word-break: break-all; max-width: 200px;">
                    ${emailItem.invitation.qr_code_data}
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
          .eq('id', emailItem.invitation.id);

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

    return new Response(
      JSON.stringify({
        success: true,
        processed: pendingEmails.length,
        sent: sentCount,
        failed: failedCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in send-invitation-emails function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
