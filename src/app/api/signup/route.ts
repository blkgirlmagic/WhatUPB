import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { getSupabase } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

function calculateAge(month: number, day: number, year: number): number {
  const today = new Date();
  const birthDate = new Date(year, month - 1, day);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

function hashIP(ip: string): string {
  return crypto
    .createHash("sha256")
    .update(ip + "_whatupb_rate_limit")
    .digest("hex")
    .substring(0, 16);
}

export async function POST(request: NextRequest) {
  try {
    // 0. Rate limit — 3 signup attempts per minute per IP
    const clientIP =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const ipHash = clientIP !== "unknown" ? hashIP(clientIP) : null;
    const rateCheck = checkRateLimit(ipHash, { maxRequests: 3, prefix: "signup" });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, email, password, month, day, year } = body;

    // 1. Validate required fields
    if (!username || !email || !password || !month || !day || !year) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // 1.5 Check for age_blocked httpOnly cookie (set by /api/verify-age)
    const cookieStore = await cookies();
    const ageBlocked = cookieStore.get("age_blocked");
    if (ageBlocked?.value === "1") {
      return NextResponse.json(
        { error: "You must be 18 or older to sign up." },
        { status: 403 }
      );
    }

    // 2. Validate username format
    const trimmedUsername = String(username).trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(trimmedUsername)) {
      return NextResponse.json(
        {
          error:
            "Username must be 3-20 characters: letters, numbers, underscores only.",
        },
        { status: 400 }
      );
    }

    // 3. Validate password strength
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter." },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one number." },
        { status: 400 }
      );
    }

    if (!/[!@#$%^&*]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one special character (!@#$%^&*)." },
        { status: 400 }
      );
    }

    // 4. Validate date components
    const m = Number(month);
    const d = Number(day);
    const y = Number(year);

    if (
      !Number.isInteger(m) ||
      m < 1 ||
      m > 12 ||
      !Number.isInteger(d) ||
      d < 1 ||
      d > 31 ||
      !Number.isInteger(y) ||
      y < 1900 ||
      y > new Date().getFullYear()
    ) {
      return NextResponse.json(
        { error: "Invalid date of birth." },
        { status: 400 }
      );
    }

    // 5. Validate the date is real (e.g., Feb 30 is invalid)
    const testDate = new Date(y, m - 1, d);
    if (
      testDate.getFullYear() !== y ||
      testDate.getMonth() !== m - 1 ||
      testDate.getDate() !== d
    ) {
      return NextResponse.json(
        { error: "Invalid date of birth." },
        { status: 400 }
      );
    }

    // 6. SERVER-SIDE AGE CHECK
    const age = calculateAge(m, d, y);
    if (age < 18) {
      return NextResponse.json(
        { error: "You must be 18 or older to sign up." },
        { status: 403 }
      );
    }

    // 7. Check username uniqueness
    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", trimmedUsername)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Username is already taken." },
        { status: 409 }
      );
    }

    // 8. Create user — store DOB + age_verified in user metadata
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: String(email).trim(),
      password,
      options: {
        emailRedirectTo: "https://whatupb.com/auth/callback",
        data: {
          username: trimmedUsername,
          age_verified: true,
          date_of_birth: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        },
      },
    });

    if (signUpError) {
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      );
    }

    // Detect duplicate email: Supabase returns a user with empty identities
    // instead of an error when the email is already registered
    if (
      data.user &&
      (!data.user.identities || data.user.identities.length === 0)
    ) {
      return NextResponse.json(
        {
          error:
            "This email is already in use. Try logging in or use a different email.",
          code: "EMAIL_EXISTS",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: true, user: data.user ? { id: data.user.id } : null },
      { status: 201 }
    );
  } catch (err) {
    console.error(
      "[signup] Error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
