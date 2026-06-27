import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { clerkMiddleware } from "@clerk/express";

import categoriesRouter from "./routes/categories";
import memoriesRouter from "./routes/memories";
import remindersRouter from "./routes/reminders";
import chatRouter from "./routes/chat";
import advisorRouter from "./routes/advisor";
import { seedDefaultCategories } from "./utils/seedCategories";

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: (origin, callback) => {
      // Dynamically allow any secure HTTPS deployment domain or localhost ports
      if (!origin || origin.startsWith("https://") || origin.startsWith("http://localhost")) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" })); // 10MB limit for base64 image uploads
app.use(clerkMiddleware()); // Attach Clerk auth context to every request

// ── MongoDB Connection Interceptor ──────────────────────────────────────────────

let cachedDbConnection: typeof mongoose | null = null;

async function connectToDatabase() {
  if (cachedDbConnection) {
    return cachedDbConnection;
  }
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set in environment variables");
  }
  cachedDbConnection = await mongoose.connect(mongoUri);
  console.log("✅ Connected to MongoDB Atlas");
  
  // Seed default categories
  await seedDefaultCategories();
  
  return cachedDbConnection;
}

// Intercept all requests to ensure MongoDB is connected before routes execute
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error: any) {
    console.error("❌ Database connection failed:", error);
    res.status(500).json({ error: "Database connection failed", details: error.message });
  }
});

// ── Routes ────────────────────────────────────────────────────────────────────

app.use("/api/categories", categoriesRouter);
app.use("/api/memories", memoriesRouter);
app.use("/api/reminders", remindersRouter);
app.use("/api/chat", chatRouter);
app.use("/api/advisor", advisorRouter);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "MemoryVault API is running" });
});

// Only listen on a port if NOT running as a serverless function on Vercel
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`🚀 MemoryVault Server running on http://localhost:${PORT}`);
  });
}

export default app;

