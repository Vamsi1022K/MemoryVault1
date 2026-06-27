import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import Memory from "../models/Memory";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey && apiKey !== "your_gemini_api_key_here" ? new GoogleGenerativeAI(apiKey) : null;

/**
 * POST /api/chat
 * RAG chatbot: retrieves matching memories from MongoDB and passes them
 * as context to Gemini to generate a grounded answer.
 */
router.post("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).dbUser;
    const { message, history } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // 1. Keyword extraction — filter stop words
    const stopWords = new Set([
      "where", "what", "show", "find", "my", "your", "the", "and", "is", "are",
      "was", "were", "in", "on", "at", "about", "me", "for", "with", "this", "that",
    ]);
    const keywords = message
      .toLowerCase()
      .replace(/[?.!,;:]/g, "")
      .split(/\s+/)
      .filter((word: string) => word.length > 2 && !stopWords.has(word));

    let memories: any[] = [];

    // 2. Database retrieval using keyword search
    if (keywords.length > 0) {
      const orConditions = keywords.flatMap((keyword: string) => [
        { name: { $regex: keyword, $options: "i" } },
        { location: { $regex: keyword, $options: "i" } },
        { notes: { $regex: keyword, $options: "i" } },
      ]);

      memories = await Memory.find({ userId: user._id, $or: orConditions })
        .populate("categoryId", "name");
    }

    // Fallback: fetch recent 50 memories if no keyword matches
    if (memories.length === 0) {
      memories = await Memory.find({ userId: user._id })
        .populate("categoryId", "name")
        .limit(50);
    }

    // 3. Format memories as text context
    const memoriesContext = memories
      .map(
        (m, index) =>
          `${index + 1}. Item: "${m.name}" | Location: "${m.location}" | Category: "${(m.categoryId as any)?.name || "Unknown"}"${
            m.notes ? ` | Notes: "${m.notes}"` : ""
          }${m.reminderDate ? ` | Reminder Date: "${new Date(m.reminderDate).toLocaleDateString()}"` : ""}`
      )
      .join("\n");

    // 4. Build conversation history context
    let historyContext = "";
    if (Array.isArray(history) && history.length > 0) {
      const filteredHistory =
        history[history.length - 1].content === message ? history.slice(0, -1) : history;
      const recentHistory = filteredHistory.slice(-6);
      historyContext = recentHistory
        .map((h: any) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`)
        .join("\n");
    }

    if (!genAI) {
      res.json({ response: "AI Assistant is not configured. Please add a valid GEMINI_API_KEY to your .env file." });
      return;
    }

    // 5. Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are MemoryVault AI Assistant, a helpful personal memory chatbot. Your goal is to help the user locate their physical items, documents, and reminders.

${historyContext ? `Below is the conversation history so far:\n---\n${historyContext}\n---\n` : ""}

Below is a text list of the user's saved memories (items, locations, notes, categories, etc.):
---
${memoriesContext || "No matching memories found in the database."}
---

Using the memories list and conversation history above, answer the user's latest query: "${message}"

Instructions:
1. If the user is asking to add a new memory, politely guide them to the Memories page (located at /memories) in the sidebar. Advise them to click the "Add Memory" button to add it.
2. If the answer can be found in the provided memories context, state the storage location and details clearly and concisely.
3. If the answer cannot be found in the memories context, politely state that you could not find any matching items in their saved memories. Suggest adding it as a new memory.
4. Be friendly, helpful, and direct. Keep your response concise (1-2 sentences is usually best).
5. Do NOT hallucinate or make up items, locations, or details that are not in the context list.
6. If the user asks for "all documents" or similar lists, present them clearly as a clean list based only on the context provided.`;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("POST Chat Error:", error);
    res.status(500).json({ error: "Failed to process chat query" });
  }
});

export default router;
