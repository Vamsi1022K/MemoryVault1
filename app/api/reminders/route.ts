import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth-db";

/**
 * Handles GET requests to retrieve all reminders associated with the user's memories.
 */
export async function GET() {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reminders = await prisma.reminder.findMany({
      where: {
        userId: user.id,
      },
      include: {
        memory: true,
      },
      orderBy: {
        reminderDate: "asc",
      },
    });

    return NextResponse.json(reminders);
  } catch (error) {
    console.error("GET Reminders Error:", error);
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}
