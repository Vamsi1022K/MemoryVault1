import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth-db";

/**
 * Handles PATCH requests to toggle the completion status of a reminder.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { completed } = body;

    if (typeof completed !== "boolean") {
      return NextResponse.json({ error: "completed field must be a boolean" }, { status: 400 });
    }

    // Verify ownership of the reminder
    const existingReminder = await prisma.reminder.findUnique({
      where: { id, userId: user.id },
    });

    if (!existingReminder) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }

    // Update completion state
    const updatedReminder = await prisma.reminder.update({
      where: { id },
      data: {
        completed: completed,
      },
    });

    return NextResponse.json(updatedReminder);
  } catch (error) {
    console.error("PATCH Reminder Error:", error);
    return NextResponse.json({ error: "Failed to update reminder" }, { status: 500 });
  }
}
