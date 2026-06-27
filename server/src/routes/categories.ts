import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import Category from "../models/Category";
import { z } from "zod";

const router = Router();

const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be under 50 characters")
    .regex(/^[a-zA-Z0-9\s-]+$/, "Category name can only contain letters, numbers, spaces, and hyphens"),
});

/**
 * GET /api/categories
 * Returns system default categories + the authenticated user's custom categories.
 */
router.get("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).dbUser;

    const categories = await Category.find({
      $or: [{ userId: null }, { userId: user._id }],
    }).sort({ name: 1 });

    res.json(categories);
  } catch (error) {
    console.error("GET Categories Error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

/**
 * POST /api/categories
 * Creates a new custom category for the authenticated user.
 */
router.post("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).dbUser;

    const validation = categorySchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.format() });
      return;
    }

    const { name } = validation.data;

    // Check for duplicate (case-insensitive) among system and user categories
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      $or: [{ userId: null }, { userId: user._id }],
    });

    if (existing) {
      res.status(400).json({ error: "Category already exists" });
      return;
    }

    const category = await Category.create({
      name,
      isCustom: true,
      userId: user._id,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("POST Category Error:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

export default router;
