// ---------------------------------------------------------------------------
//  CSRF protection via custom-header check.
//
//  Browsers enforce that cross-origin requests with custom headers trigger a
//  CORS preflight.  Because our API routes don't set `Access-Control-Allow-*`
//  headers, the preflight fails and the actual request is never sent.
//
//  A plain <form> POST (the classic CSRF vector) cannot set custom headers at
//  all, so it is also blocked.
//
//  Usage:  import { requireCsrfHeader } from "@/lib/csrf";
//          const csrfError = requireCsrfHeader(request);
//          if (csrfError) return csrfError;
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";

const HEADER_NAME = "x-csrf-protection";
const EXPECTED_VALUE = "1";

/**
 * Returns a 403 response if the required CSRF header is missing or wrong.
 * Returns `null` when the request is safe to proceed.
 */
export function requireCsrfHeader(request: NextRequest | Request): NextResponse | null {
  const value = request.headers.get(HEADER_NAME);
  if (value === EXPECTED_VALUE) {
    return null; // ✅ header present — safe
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
