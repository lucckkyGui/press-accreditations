import { describe, it, expect } from "vitest";
import {
  validateSubmission,
  isValidEmail,
  isDisposableEmail,
  isValidUrl,
  areValidUrlList,
  splitLinks,
  isValidRole,
  getConditionalRequired,
  requiredFieldsFromConfig,
  DISPOSABLE_EMAIL_DOMAINS,
} from "../submissionValidation";
import type { SubmissionData, FormConfig } from "../types";

const baseJournalist: SubmissionData = {
  first_name: "Anna",
  last_name: "Kowalska",
  email: "anna.kowalska@gazeta.pl",
  role: "journalist",
  media_organization: "Gazeta Wyborcza",
  publication_links: "https://wyborcza.pl/artykul-1\nhttps://wyborcza.pl/artykul-2",
  consent_data_processing: true,
};

describe("helpers", () => {
  it("isValidEmail accepts normal addresses, rejects malformed", () => {
    expect(isValidEmail("john@example.com")).toBe(true);
    expect(isValidEmail("john.doe+tag@sub.example.co.uk")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("john@")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail(123 as unknown as string)).toBe(false);
  });

  it("isDisposableEmail flags known throwaway domains", () => {
    expect(isDisposableEmail("bot@mailinator.com")).toBe(true);
    expect(isDisposableEmail("bot@tempmail.com")).toBe(true);
    expect(isDisposableEmail("real@gazeta.pl")).toBe(false);
    // wszystkie domeny z listy są wykrywane
    for (const d of DISPOSABLE_EMAIL_DOMAINS) {
      expect(isDisposableEmail(`x@${d}`)).toBe(true);
    }
  });

  it("isValidUrl requires http/https protocol", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("http://example.com/path?q=1")).toBe(true);
    expect(isValidUrl("ftp://example.com")).toBe(false);
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
    expect(isValidUrl("example.com")).toBe(false);
    expect(isValidUrl("")).toBe(false);
  });

  it("splitLinks / areValidUrlList handle multi-line lists", () => {
    expect(splitLinks("https://a.com\nhttps://b.com")).toEqual([
      "https://a.com",
      "https://b.com",
    ]);
    expect(areValidUrlList("https://a.com\nhttps://b.com")).toBe(true);
    expect(areValidUrlList("https://a.com\nnot-a-url")).toBe(false);
    expect(areValidUrlList("")).toBe(false);
  });

  it("isValidRole only accepts known roles", () => {
    expect(isValidRole("journalist")).toBe(true);
    expect(isValidRole("photographer")).toBe(true);
    expect(isValidRole("ceo")).toBe(false);
    expect(isValidRole(undefined)).toBe(false);
  });

  it("getConditionalRequired maps roles to extra required fields", () => {
    expect(getConditionalRequired("photographer")).toContain("portfolio_url");
    expect(getConditionalRequired("video")).toEqual(["coverage_description"]);
    expect(getConditionalRequired("influencer")).toEqual(["social_media"]);
    expect(getConditionalRequired("journalist")).toEqual([
      "media_organization",
      "publication_links",
    ]);
    expect(getConditionalRequired("other")).toEqual([]);
  });

  it("requiredFieldsFromConfig returns only visible+required keys", () => {
    const config: FormConfig = {
      fields: [
        { key: "first_name", label: "Imię", type: "text", required: true, visible: true },
        { key: "phone", label: "Tel", type: "tel", required: true, visible: false },
        { key: "job_title", label: "Stanowisko", type: "text", required: false, visible: true },
      ],
      accreditation_types: [],
    };
    expect(requiredFieldsFromConfig(config)).toEqual(["first_name"]);
    expect(requiredFieldsFromConfig(null)).toEqual([]);
  });
});

describe("validateSubmission — scenarios", () => {
  it("1. valid journalist passes", () => {
    const res = validateSubmission(baseJournalist);
    expect(res.valid).toBe(true);
    expect(res.errors).toEqual({});
  });

  it("2. valid photographer (portfolio only) passes", () => {
    const res = validateSubmission({
      first_name: "Jan",
      last_name: "Nowak",
      email: "jan@foto.pl",
      role: "photographer",
      portfolio_url: "https://500px.com/jannowak",
      consent_data_processing: true,
    });
    expect(res.valid).toBe(true);
  });

  it("2b. valid photographer (publication_links only) passes", () => {
    const res = validateSubmission({
      first_name: "Jan",
      last_name: "Nowak",
      email: "jan@foto.pl",
      role: "photographer",
      publication_links: "https://foto.pl/galeria",
      consent_data_processing: true,
    });
    expect(res.valid).toBe(true);
  });

  it("3. valid influencer passes", () => {
    const res = validateSubmission({
      first_name: "Kasia",
      last_name: "Wiśniewska",
      email: "kasia@creator.pl",
      role: "influencer",
      social_media: "instagram.com/kasia",
      consent_data_processing: true,
    });
    expect(res.valid).toBe(true);
  });

  it("4. missing required field (last_name) fails", () => {
    const res = validateSubmission({ ...baseJournalist, last_name: "" });
    expect(res.valid).toBe(false);
    expect(res.errors.last_name).toBeDefined();
  });

  it("6. disposable email fails", () => {
    const res = validateSubmission({ ...baseJournalist, email: "spam@mailinator.com" });
    expect(res.valid).toBe(false);
    expect(res.errors.email).toContain("tymczasowe");
  });

  it("7. invalid portfolio URL fails", () => {
    const res = validateSubmission({
      first_name: "Jan",
      last_name: "Nowak",
      email: "jan@foto.pl",
      role: "photographer",
      portfolio_url: "not a url",
      consent_data_processing: true,
    });
    expect(res.valid).toBe(false);
    expect(res.errors.portfolio_url).toBeDefined();
  });

  it("photographer without portfolio AND without links fails", () => {
    const res = validateSubmission({
      first_name: "Jan",
      last_name: "Nowak",
      email: "jan@foto.pl",
      role: "photographer",
      consent_data_processing: true,
    });
    expect(res.valid).toBe(false);
    expect(res.errors.portfolio_url).toBeDefined();
  });

  it("video without coverage_description fails", () => {
    const res = validateSubmission({
      first_name: "Tomasz",
      last_name: "Lewandowski",
      email: "tomasz@tv.pl",
      role: "video",
      consent_data_processing: true,
    });
    expect(res.valid).toBe(false);
    expect(res.errors.coverage_description).toBeDefined();
  });

  it("influencer without social_media fails", () => {
    const res = validateSubmission({
      first_name: "Kasia",
      last_name: "Wiśniewska",
      email: "kasia@creator.pl",
      role: "influencer",
      consent_data_processing: true,
    });
    expect(res.valid).toBe(false);
    expect(res.errors.social_media).toBeDefined();
  });

  it("journalist missing publication_links fails", () => {
    const res = validateSubmission({
      first_name: "Anna",
      last_name: "Kowalska",
      email: "anna@gazeta.pl",
      role: "journalist",
      media_organization: "Gazeta",
      consent_data_processing: true,
    });
    expect(res.valid).toBe(false);
    expect(res.errors.publication_links).toBeDefined();
  });

  it("missing consent_data_processing fails (default requireConsent)", () => {
    const res = validateSubmission({ ...baseJournalist, consent_data_processing: false });
    expect(res.valid).toBe(false);
    expect(res.errors.consent_data_processing).toBeDefined();
  });

  it("requireTerms enforces accept_terms", () => {
    const res = validateSubmission(baseJournalist, { requireTerms: true });
    expect(res.valid).toBe(false);
    expect(res.errors.accept_terms).toBeDefined();

    const ok = validateSubmission({ ...baseJournalist, accept_terms: true }, { requireTerms: true });
    expect(ok.valid).toBe(true);
  });

  it("config requiredFields are enforced", () => {
    const res = validateSubmission(baseJournalist, { requiredFields: ["phone"] });
    expect(res.valid).toBe(false);
    expect(res.errors.phone).toBeDefined();

    const ok = validateSubmission(
      { ...baseJournalist, phone: "+48 600 100 200" },
      { requiredFields: ["phone"] },
    );
    expect(ok.valid).toBe(true);
  });

  it("invalid email format fails before disposable check", () => {
    const res = validateSubmission({ ...baseJournalist, email: "broken@" });
    expect(res.valid).toBe(false);
    expect(res.errors.email).toContain("format");
  });
});
