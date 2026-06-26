import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth-db";
import { generateStorageAdvice } from "@/lib/gemini";

/**
 * Handles POST requests for the Storage Advisor.
 * Sends queries directly to Gemini with system instructions to provide safety and organizational advice.
 */
export async function POST(req: Request) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Call Gemini helper for general storage recommendations
    const advice = await generateStorageAdvice(message);

    return NextResponse.json({ response: advice });
  } catch (error) {
    console.error("POST Storage Advisor Error:", error);
    return NextResponse.json({ error: "Failed to retrieve storage advice" }, { status: 500 });
  }
}
