import prisma from "./prisma";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Syncs the Clerk authenticated user with the database.
 * If the user does not exist in our database, they are created.
 * Returns the database user record, or null if the user is not authenticated.
 */
export async function getOrCreateUser() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return null;
    }

    // Check if the user already exists in our database
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    // If not, create the user record
    if (!user) {
      const email = clerkUser.emailAddresses[0]?.emailAddress || "";
      const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null;

      user = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: email,
          name: name,
        },
      });
    }

    return user;
  } catch (error) {
    console.error("Error in getOrCreateUser:", error);
    return null;
  }
}
