import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey && apiKey !== "your_gemini_api_key_here" ? new GoogleGenerativeAI(apiKey) : null;

/**
 * POST /api/advisor
 * Storage & Preservation Advisor — answers general storage/organization questions using Gemini.
 */
router.post("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    if (!genAI) {
      res.json({
        response:
          "Storage Advisor is not configured. Please add a valid GEMINI_API_KEY to your .env file to enable this feature.",
      });
      return;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are the MemoryVault Storage & Organization Advisor. Your goal is to provide helpful, practical, and safe organization advice for household items, valuables, documents, or medicines.

User's Question: "${message}"

Instructions:
1. Provide actionable advice covering key storage factors (e.g., environment, safety/security, organization).
2. Structure your response into exactly 3-4 brief, readable bullet points with bold headers (e.g., **Environment**: ...). Avoid long paragraphs.
3. Keep the total response very concise, structured, and easy to read.
4. IMPORTANT: You MUST conclude your response with the following exact warning disclaimer on a new line:

Disclaimer: This advice is for informational and organizational purposes only. Please consult professional security experts, specialized contractors, or product manufacturers for critical safety, high-value storage, or hazardous material handling.`;

    const result = await model.generateContent(prompt);
    const advice = result.response.text();

    res.json({ response: advice });
  } catch (error) {
    console.error("POST Storage Advisor Error:", error);
    res.status(500).json({ error: "Failed to retrieve storage advice" });
  }
});

export default router;
