import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import User from "../models/User";
import { clerkClient } from "@clerk/express";

/**
 * Middleware: Authenticate the request using Clerk.
 * Attaches the MongoDB user document to req.dbUser.
 * If the user doesn't exist in MongoDB yet, it creates one (first-time login).
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Check if user already exists in MongoDB
    let user = await User.findOne({ clerkId });

    if (!user) {
      // First login: fetch user details from Clerk and create a record
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress || "";
      const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null;

      user = await User.create({ clerkId, email, name });
    }

    // Attach user to request object for use in route handlers
    (req as any).dbUser = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
}
