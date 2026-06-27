import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import Reminder from "../models/Reminder";

const router = Router();

/**
 * GET /api/reminders
 * Fetch all reminders for the authenticated user, with memory details populated.
 */
router.get("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).dbUser;

    const reminders = await Reminder.find({ userId: user._id })
      .populate("memoryId", "name location")
      .sort({ reminderDate: 1 });

    // Shape to match original API shape (memory object instead of memoryId)
    const shaped = reminders.map((r) => ({
      id: r._id,
      type: r.type,
      reminderDate: r.reminderDate,
      completed: r.completed,
      memory: {
        name: (r.memoryId as any)?.name,
        location: (r.memoryId as any)?.location,
      },
      createdAt: r.createdAt,
    }));

    res.json(shaped);
  } catch (error) {
    console.error("GET Reminders Error:", error);
    res.status(500).json({ error: "Failed to fetch reminders" });
  }
});

/**
 * PATCH /api/reminders/:id
 * Toggle the completion status of a specific reminder.
 */
router.patch("/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).dbUser;
    const { id } = req.params;
    const { completed } = req.body;

    if (typeof completed !== "boolean") {
      res.status(400).json({ error: "completed field must be a boolean" });
      return;
    }

    const existingReminder = await Reminder.findOne({ _id: id, userId: user._id });
    if (!existingReminder) {
      res.status(404).json({ error: "Reminder not found" });
      return;
    }

    const updated = await Reminder.findByIdAndUpdate(
      id,
      { completed },
      { new: true }
    );

    res.json({ id: updated!._id, completed: updated!.completed });
  } catch (error) {
    console.error("PATCH Reminder Error:", error);
    res.status(500).json({ error: "Failed to update reminder" });
  }
});

export default router;
