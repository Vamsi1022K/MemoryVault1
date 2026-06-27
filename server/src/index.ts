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
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" })); // 10MB limit for base64 image uploads
app.use(clerkMiddleware()); // Attach Clerk auth context to every request

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

// ── MongoDB Connection ────────────────────────────────────────────────────────

async function startServer() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌ MONGODB_URI is not set in your .env file");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB Atlas");

    // Seed default categories on first start
    await seedDefaultCategories();

    app.listen(PORT, () => {
      console.log(`🚀 MemoryVault Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}

startServer();
