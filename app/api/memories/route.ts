import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth-db";
import { memorySchema } from "@/lib/schemas";

/**
 * Handles GET requests to retrieve memories, support simple search & category filters.
 */
export async function GET(req: Request) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("categoryId") || "";

  try {
    const memories = await prisma.memory.findMany({
      where: {
        userId: user.id,
        ...(categoryId ? { categoryId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { location: { contains: search, mode: "insensitive" } },
                { notes: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(memories);
  } catch (error) {
    console.error("GET Memories Error:", error);
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
  }
}

/**
 * Handles POST requests to create a new memory and optionally trigger a reminder.
 */
export async function POST(req: Request) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Server-side Zod validation
    const validation = memorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const data = validation.data;

    // Check if name already exists for this user (case-insensitive)
    const duplicate = await prisma.memory.findFirst({
      where: {
        userId: user.id,
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

    // Create memory and optionally its related reminder atomically
    const newMemory = await prisma.memory.create({
      data: {
        name: data.name,
        location: data.location,
        notes: data.notes,
        photoUrl: data.photoUrl,
        reminderDate: data.reminderDate ? new Date(data.reminderDate) : null,
        categoryId: data.categoryId,
        userId: user.id,
        ...(data.reminderDate
          ? {
              reminders: {
                create: {
                  type: "DATE",
                  reminderDate: new Date(data.reminderDate),
                  userId: user.id,
                },
              },
            }
          : {}),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(newMemory, { status: 201 });
  } catch (error) {
    console.error("POST Memory Error:", error);
    return NextResponse.json({ error: "Failed to create memory" }, { status: 500 });
  }
}
