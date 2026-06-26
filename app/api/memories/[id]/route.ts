import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth-db";
import { memorySchema } from "@/lib/schemas";

/**
 * Handles PUT requests to update a specific memory.
 * Manages associated reminders based on the updated reminder date.
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // In Next.js 15+, params is a Promise and must be awaited
  const { id } = await params;

  try {
    const body = await req.json();
    
    // Server-side Zod validation
    const validation = memorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const data = validation.data;

    // Verify ownership of the memory
    const existingMemory = await prisma.memory.findUnique({
      where: { id, userId: user.id },
    });

    if (!existingMemory) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    // Check for duplicate name (excluding the current memory being edited)
    const duplicate = await prisma.memory.findFirst({
      where: {
        userId: user.id,
        id: { not: id },
        name: {
          equals: data.name,
          mode: "insensitive",
        },
      },
    });

    if (duplicate) {
      let suggestion = `${data.name} 2`;
      let counter = 2;
      
      // Loop to find the first unused number suffix
      while (true) {
        const checkName = `${data.name} ${counter}`;
        const exists = await prisma.memory.findFirst({
          where: {
            userId: user.id,
            name: {
              equals: checkName,
              mode: "insensitive",
            },
          },
        });
        if (!exists) {
          suggestion = checkName;
          break;
        }
        counter++;
      }

      return NextResponse.json(
        { error: `An item with the name "${data.name}" already exists. Try naming it "${suggestion}" instead.` },
        { status: 400 }
      );
    }

    // Update the memory
    const updatedMemory = await prisma.memory.update({
      where: { id },
      data: {
        name: data.name,
        location: data.location,
        notes: data.notes,
        photoUrl: data.photoUrl,
        reminderDate: data.reminderDate ? new Date(data.reminderDate) : null,
        categoryId: data.categoryId,
      },
    });

    // Synchronize reminders
    if (data.reminderDate) {
      const existingReminder = await prisma.reminder.findFirst({
        where: { memoryId: id },
      });

      if (existingReminder) {
        // If a reminder already exists, update the date and reset completion status
        await prisma.reminder.update({
          where: { id: existingReminder.id },
          data: {
            reminderDate: new Date(data.reminderDate),
            completed: false, 
          },
        });
      } else {
        // Create new reminder if it didn't exist before
        await prisma.reminder.create({
          data: {
            memoryId: id,
            type: "DATE",
            reminderDate: new Date(data.reminderDate),
            userId: user.id,
          },
        });
      }
    } else {
      // If reminderDate was removed, delete any associated reminders
      await prisma.reminder.deleteMany({
        where: { memoryId: id },
      });
    }

    return NextResponse.json(updatedMemory);
  } catch (error) {
    console.error("PUT Memory Error:", error);
    return NextResponse.json({ error: "Failed to update memory" }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to remove a specific memory.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Await async params for Next.js 15+
  const { id } = await params;

  try {
    // Verify ownership
    const existingMemory = await prisma.memory.findUnique({
      where: { id, userId: user.id },
    });

    if (!existingMemory) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    // Delete memory (reminders cascade delete automatically based on schema definition)
    await prisma.memory.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Memory deleted successfully" });
  } catch (error) {
    console.error("DELETE Memory Error:", error);
    return NextResponse.json({ error: "Failed to delete memory" }, { status: 500 });
  }
}
