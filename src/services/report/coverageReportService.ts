/**
 * Warstwa danych Media Coverage Report — pobiera dane i składa raport.
 * Czysta logika w `@/lib/report/coverageReport`.
 */
import { supabase } from "@/integrations/supabase/client";
import {
  buildCoverageReport, type CoverageReport,
  type ReportSubmission, type ReportGuest, type ReportCoverageRequest, type ReportCoverageItem,
} from "@/lib/report/coverageReport";

const sb = () => supabase as any;

export async function generateCoverageReport(eventId: string): Promise<CoverageReport> {
  const { data: ev } = await sb().from("events")
    .select("title, start_date, end_date, location").eq("id", eventId).maybeSingle();

  const [subsRes, guestsRes, reqRes] = await Promise.all([
    sb().from("landing_page_submissions").select("email, status, media_organization").eq("event_id", eventId),
    sb().from("guests").select("email, company, checked_in_at, status").eq("event_id", eventId),
    sb().from("coverage_requests").select("id, email, media_name, status").eq("event_id", eventId),
  ]);

  const submissions = (subsRes.data ?? []) as ReportSubmission[];
  const guests = (guestsRes.data ?? []) as ReportGuest[];
  const coverageRequests = (reqRes.data ?? []) as ReportCoverageRequest[];

  let coverageItems: ReportCoverageItem[] = [];
  const reqIds = coverageRequests.map((r) => r.id);
  if (reqIds.length > 0) {
    const { data: items } = await sb().from("coverage_items")
      .select("coverage_request_id, article_url, gallery_url, video_url, social_post_url, publication_date, estimated_reach, sponsor_mentions, publication_type, verified_at")
      .in("coverage_request_id", reqIds);
    coverageItems = (items ?? []) as ReportCoverageItem[];
  }

  return buildCoverageReport({
    eventTitle: ev?.title ?? "Wydarzenie",
    eventStart: ev?.start_date ?? null,
    eventEnd: ev?.end_date ?? null,
    eventLocation: ev?.location ?? null,
    submissions, guests, coverageRequests, coverageItems,
  });
}
