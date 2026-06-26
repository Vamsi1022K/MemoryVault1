import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

// Helper to check if API key is configured
export const isGeminiConfigured = () => {
  return typeof apiKey === "string" && apiKey.trim().length > 0 && apiKey !== "your_gemini_api_key_here";
};

// Initialize the Gemini API client
const genAI = isGeminiConfigured() ? new GoogleGenerativeAI(apiKey!) : null;

/**
 * Generates an answer to the user's query based solely on their saved memories.
 * (Simple Retrieval-Augmented Generation / RAG)
 */
export async function generateRAGResponse(
  query: string, 
  memoriesContext: string, 
  historyContext?: string
): Promise<string> {
  if (!genAI) {
    return "AI Assistant is not configured. Please add a valid GEMINI_API_KEY to your .env file to enable this feature.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are MemoryVault AI Assistant, a helpful personal memory chatbot. Your goal is to help the user locate their physical items, documents, and reminders.

${historyContext ? `Below is the conversation history so far:\n---\n${historyContext}\n---\n` : ""}

Below is a text list of the user's saved memories (items, locations, notes, categories, etc.):
---
${memoriesContext || "No matching memories found in the database."}
---

Using the memories list and conversation history above, answer the user's latest query: "${query}"

Instructions:
1. If the user is asking to add a new memory (e.g. they say "yes", "add it", "how do I add", or similar in response to your suggestion to add an item), politely guide them to the Memories page (located at /memories) in the sidebar. Advise them to click the "Add Memory" button to add it.
2. If the answer can be found in the provided memories context, state the storage location and details clearly and concisely.
3. If the answer cannot be found in the memories context, politely state that you could not find any matching items in their saved memories. Suggest adding it as a new memory.
4. Be friendly, helpful, and direct. Keep your response concise (1-2 sentences is usually best).
5. Do NOT hallucinate or make up items, locations, or details that are not in the context list.
6. If the user asks for "all documents" or similar lists, present them clearly as a clean list based only on the context provided.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini RAG Response Error:", error);
    return "Sorry, I encountered an error while processing your request. Please try again later.";
  }
}

/**
 * Generates general storage, preservation, and organization advice for various types of items.
 */
export async function generateStorageAdvice(query: string): Promise<string> {
  if (!genAI) {
    return "Storage Advisor is not configured. Please add a valid GEMINI_API_KEY to your .env file to enable this feature.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are the MemoryVault Storage & Organization Advisor. Your goal is to provide helpful, practical, and safe organization advice for household items, valuables, documents, or medicines.

User's Question: "${query}"

Instructions:
1. Provide actionable advice covering key storage factors (e.g., environment, safety/security, organization).
2. Structure your response into exactly 3-4 brief, readable bullet points with bold headers (e.g., **Environment**: ...). Avoid long paragraphs.
3. Keep the total response very concise, structured, and easy to read.
4. IMPORTANT: You MUST conclude your response with the following exact warning disclaimer on a new line:

Disclaimer: This advice is for informational and organizational purposes only. Please consult professional security experts, specialized contractors, or product manufacturers for critical safety, high-value storage, or hazardous material handling.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Storage Advisor Error:", error);
    return "Sorry, I encountered an error while retrieving storage advice. Please try again later.";
  }
}
