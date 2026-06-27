import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import Memory from "../models/Memory";
import Reminder from "../models/Reminder";
import { z } from "zod";

const router = Router();

const memorySchema = z.object({
  name: z.string().min(1, "Item name is required").max(100, "Name is too long"),
  location: z.string().min(1, "Storage location is required").max(150, "Location is too long"),
  notes: z.string().max(1000, "Notes can be up to 1000 characters").optional().nullable(),
  photoUrl: z
    .string()
    .optional()
    .nullable()
    .or(z.literal(""))
    .refine(
      (val) => {
        if (!val) return true;
        return val.startsWith("http://") || val.startsWith("https://") || val.startsWith("data:image/");
      },
      { message: "Must be a valid image URL or uploaded file" }
    ),
  categoryId: z.string().min(1, "Category is required"),
  reminderDate: z.string().optional().nullable().or(z.literal("")),
}).refine(
  (data) => {
    if (data.reminderDate) {
      const selectedDate = new Date(data.reminderDate);
      selectedDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }
    return true;
  },
  { message: "Reminder/expiry date cannot be in the past", path: ["reminderDate"] }
);

/**
 * GET /api/memories
 * Fetch user's memories with optional search and category filter.
 */
router.get("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).dbUser;
    const { search = "", categoryId = "" } = req.query as { search?: string; categoryId?: string };

    const filter: any = { userId: user._id };

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    const memories = await Memory.find(filter)
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });

    // Shape the response to match the original API shape (category object instead of categoryId)
    const shaped = memories.map((m) => ({
      id: m._id,
      name: m.name,
      location: m.location,
      notes: m.notes,
      photoUrl: m.photoUrl,
      reminderDate: m.reminderDate,
      categoryId: (m.categoryId as any)?._id || m.categoryId,
      category: { id: (m.categoryId as any)?._id, name: (m.categoryId as any)?.name },
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));

    res.json(shaped);
  } catch (error) {
    console.error("GET Memories Error:", error);
    res.status(500).json({ error: "Failed to fetch memories" });
  }
});

/**
 * POST /api/memories
 * Create a new memory and optionally create a reminder for it.
 */
router.post("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).dbUser;

    const validation = memorySchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.format() });
      return;
    }

    const data = validation.data;

    // Check for duplicate name (case-insensitive)
    const duplicate = await Memory.findOne({
      userId: user._id,
      name: { $regex: new RegExp(`^${data.name}$`, "i") },
    });

    if (duplicate) {
      let counter = 2;
      let suggestion = `${data.name} ${counter}`;
      while (true) {
        const exists = await Memory.findOne({
          userId: user._id,
          name: { $regex: new RegExp(`^${suggestion}$`, "i") },
        });
        if (!exists) break;
        counter++;
        suggestion = `${data.name} ${counter}`;
      }
      res.status(400).json({
        error: `An item with the name "${data.name}" already exists. Try naming it "${suggestion}" instead.`,
      });
      return;
    }

    const newMemory = await Memory.create({
      name: data.name,
      location: data.location,
      notes: data.notes || null,
      photoUrl: data.photoUrl || null,
      reminderDate: data.reminderDate ? new Date(data.reminderDate) : null,
      categoryId: data.categoryId,
      userId: user._id,
    });

    // Create reminder if a reminder date was provided
    if (data.reminderDate) {
      await Reminder.create({
        memoryId: newMemory._id,
        type: "DATE",
        reminderDate: new Date(data.reminderDate),
        userId: user._id,
      });
    }

    const populated = await Memory.findById(newMemory._id).populate("categoryId", "name");

    res.status(201).json({
      id: populated!._id,
      name: populated!.name,
      location: populated!.location,
      notes: populated!.notes,
      photoUrl: populated!.photoUrl,
      reminderDate: populated!.reminderDate,
      categoryId: (populated!.categoryId as any)?._id,
      category: { id: (populated!.categoryId as any)?._id, name: (populated!.categoryId as any)?.name },
      createdAt: populated!.createdAt,
    });
  } catch (error) {
    console.error("POST Memory Error:", error);
    res.status(500).json({ error: "Failed to create memory" });
  }
});

/**
 * PUT /api/memories/:id
 * Update an existing memory and sync its reminder.
 */
router.put("/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).dbUser;
    const { id } = req.params;

    const validation = memorySchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.format() });
      return;
    }

    const data = validation.data;

    // Verify ownership
    const existingMemory = await Memory.findOne({ _id: id, userId: user._id });
    if (!existingMemory) {
      res.status(404).json({ error: "Memory not found" });
      return;
    }

    // Check for duplicate name (excluding the current memory)
    const duplicate = await Memory.findOne({
      userId: user._id,
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${data.name}$`, "i") },
    });

    if (duplicate) {
      let counter = 2;
      let suggestion = `${data.name} ${counter}`;
      while (true) {
        const exists = await Memory.findOne({
          userId: user._id,
          name: { $regex: new RegExp(`^${suggestion}$`, "i") },
        });
        if (!exists) break;
        counter++;
        suggestion = `${data.name} ${counter}`;
      }
      res.status(400).json({
        error: `An item with the name "${data.name}" already exists. Try naming it "${suggestion}" instead.`,
      });
      return;
    }

    const updatedMemory = await Memory.findByIdAndUpdate(
      id,
      {
        name: data.name,
        location: data.location,
        notes: data.notes || null,
        photoUrl: data.photoUrl || null,
        reminderDate: data.reminderDate ? new Date(data.reminderDate) : null,
        categoryId: data.categoryId,
      },
      { new: true }
    ).populate("categoryId", "name");

    // Sync reminder
    if (data.reminderDate) {
      const existingReminder = await Reminder.findOne({ memoryId: id });
      if (existingReminder) {
        await Reminder.findByIdAndUpdate(existingReminder._id, {
          reminderDate: new Date(data.reminderDate),
          completed: false,
        });
      } else {
        await Reminder.create({
          memoryId: id,
          type: "DATE",
          reminderDate: new Date(data.reminderDate),
          userId: user._id,
        });
      }
    } else {
      // Remove reminders if date was cleared
      await Reminder.deleteMany({ memoryId: id });
    }

    res.json({
      id: updatedMemory!._id,
      name: updatedMemory!.name,
      location: updatedMemory!.location,
      notes: updatedMemory!.notes,
      photoUrl: updatedMemory!.photoUrl,
      reminderDate: updatedMemory!.reminderDate,
      categoryId: (updatedMemory!.categoryId as any)?._id,
      category: { id: (updatedMemory!.categoryId as any)?._id, name: (updatedMemory!.categoryId as any)?.name },
      createdAt: updatedMemory!.createdAt,
    });
  } catch (error) {
    console.error("PUT Memory Error:", error);
    res.status(500).json({ error: "Failed to update memory" });
  }
});

/**
 * DELETE /api/memories/:id
 * Delete a memory and its associated reminders.
 */
router.delete("/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).dbUser;
    const { id } = req.params;

    const existingMemory = await Memory.findOne({ _id: id, userId: user._id });
    if (!existingMemory) {
      res.status(404).json({ error: "Memory not found" });
      return;
    }

    // Delete associated reminders first, then the memory
    await Reminder.deleteMany({ memoryId: id });
    await Memory.findByIdAndDelete(id);

    res.json({ message: "Memory deleted successfully" });
  } catch (error) {
    console.error("DELETE Memory Error:", error);
    res.status(500).json({ error: "Failed to delete memory" });
  }
});

export default router;
