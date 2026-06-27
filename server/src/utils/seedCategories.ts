import mongoose from "mongoose";
import Category from "../models/Category";

/**
 * Default system categories seeded on first connection.
 * These mirror the original Prisma seed data.
 */
const DEFAULT_CATEGORIES = [
  "Documents",
  "Electronics",
  "Clothing",
  "Jewelry",
  "Medicines",
  "Tools",
  "Books",
  "Kitchen",
  "Collectibles",
  "Other",
];

export async function seedDefaultCategories() {
  try {
    const existingCount = await Category.countDocuments({ userId: null });
    if (existingCount >= DEFAULT_CATEGORIES.length) {
      return; // Already seeded
    }

    for (const name of DEFAULT_CATEGORIES) {
      await Category.findOneAndUpdate(
        { name, userId: null },
        { name, isCustom: false, userId: null },
        { upsert: true, new: true }
      );
    }

    console.log("✅ Default categories seeded successfully.");
  } catch (error) {
    console.error("❌ Error seeding default categories:", error);
  }
}
