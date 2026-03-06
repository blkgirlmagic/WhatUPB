import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { month, day, year } = body;

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

    const age = calculateAge(m, d, y);
    const cookieStore = await cookies();

    if (age < 18) {
      // Set httpOnly blocking cookie — cannot be cleared via JavaScript
      cookieStore.set("age_blocked", "1", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
      });

      return NextResponse.json({ verified: false }, { status: 403 });
    }

    // Set short-lived httpOnly verification cookie — enough time to fill out signup
    cookieStore.set("age_verified", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 10, // 10 minutes
    });

    return NextResponse.json({ verified: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
