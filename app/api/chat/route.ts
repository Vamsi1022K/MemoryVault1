import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth-db";
import { generateRAGResponse } from "@/lib/gemini";
import { Prisma } from "@prisma/client";

type MemoryWithCategory = Prisma.MemoryGetPayload<{
  include: { category: true };
}>;

/**
 * Handles POST requests for the RAG AI chatbot.
 * Searches database memories, formats them as context, and calls Gemini to answer.
 */
export async function POST(req: Request) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Keyword extraction (simple tokenization for beginner RAG)
    // Filter out common stop-words and punctuation to identify keywords
    const stopWords = new Set(["where", "what", "show", "find", "my", "your", "the", "and", "is", "are", "was", "were", "in", "on", "at", "about", "me", "for", "with", "this", "that"]);
    const keywords = message
      .toLowerCase()
      .replace(/[?.!,;:]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word));

    let memories: MemoryWithCategory[] = [];

    // 2. Database Retrieval
    if (keywords.length > 0) {
      // Find memories that match any of the extracted keywords
      memories = await prisma.memory.findMany({
        where: {
          userId: user.id,
          OR: keywords.map((keyword) => ({
            OR: [
              { name: { contains: keyword, mode: "insensitive" } },
              { location: { contains: keyword, mode: "insensitive" } },
              { notes: { contains: keyword, mode: "insensitive" } },
              { category: { name: { contains: keyword, mode: "insensitive" } } },
            ],
          })),
        },
        include: {
          category: true,
        },
      });
    }

    // Fallback: If no keyword matches, or message had no keywords, fetch recent memories (up to 50)
    if (memories.length === 0) {
      memories = await prisma.memory.findMany({
        where: { userId: user.id },
        include: { category: true },
        take: 50,
      });
    }

    // 3. Format memories context as text
    const memoriesContext = memories
      .map(
        (m, index) =>
          `${index + 1}. Item: "${m.name}" | Location: "${m.location}" | Category: "${m.category.name}"${
            m.notes ? ` | Notes: "${m.notes}"` : ""
          }${m.reminderDate ? ` | Reminder Date: "${m.reminderDate.toLocaleDateString()}"` : ""}`
      )
      .join("\n");

    // Build historyContext from the past conversation messages
    let historyContext = "";
    if (Array.isArray(history) && history.length > 0) {
      // Exclude last message if it's the current query to avoid duplication
      const filteredHistory = history[history.length - 1].content === message 
        ? history.slice(0, -1) 
        : history;
      
      const recentHistory = filteredHistory.slice(-6);
      historyContext = recentHistory
        .map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`)
        .join("\n");
    }

    // 4. Generate AI response using Gemini with retrieved context and history context
    const aiResponse = await generateRAGResponse(message, memoriesContext, historyContext);

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("POST Chat Error:", error);
    return NextResponse.json({ error: "Failed to process chat query" }, { status: 500 });
  }
}
