// Types for the WhatUPB Policy data pipeline

export type PolicyEventType =
  | "rulemaking"
  | "guidance"
  | "hearing"
  | "legislation"
  | "testimony"
  | "notice"
  | "enforcement";

export type PolicyCategory =
  | "SEC"
  | "CFTC"
  | "Stablecoin"
  | "DeFi"
  | "Digital Commodity"
  | "Government Ethics"
  | "Congress"
  | "Treasury"
  | "FinCEN"
  | "Other";

export type PolicyEventSource = "federal_register" | "congress" | "sec" | "cftc";

// Matches the policy_events Supabase table schema
export interface PolicyEvent {
  id?: number;
  external_id: string;           // fr-{document_number}
  source: PolicyEventSource;
  agency: string;                // Display name: "SEC", "CFTC", etc.
  headline: string;              // Verbatim title from API
  abstract: string | null;       // Verbatim abstract from API, or null
  event_type: PolicyEventType;
  event_date: string;            // ISO date string YYYY-MM-DD
  source_url: string;            // Official URL (html_url from FR API)
  category: PolicyCategory;
  created_at?: string;
  updated_at?: string;
}

// Matches the policy_bills Supabase table schema
export interface PolicyBill {
  id?: number;
  external_id: string;           // {congress}-{bill_type}-{bill_number}
  congress: number;
  bill_type: string;
  bill_number: number;
  title: string;
  short_title: string | null;
  sponsor: string | null;
  house_status: string | null;
  senate_status: string | null;
  overall_status:
    | "Introduced"
    | "Committee"
    | "In Progress"
    | "Passed House"
    | "Passed Senate"
    | "Enrolled"
    | "Enacted"
    | "Failed"
    | "Unknown";
  latest_action: string | null;
  latest_action_date: string | null;
  source_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface PolicyIngestResult {
  newRecords: number;
  skipped: number;
  errors: number;
  durationMs: number;
  source: string;
}
