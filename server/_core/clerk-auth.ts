import { clerkMiddleware, getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "@shared/_core/errors";
import * as db from "../db";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { SignJWT } from "jose";
import { ENV } from "./env";

const jwtSecret = new TextEncoder().encode(ENV.jwtSecret);

export function setupClerkAuth(app: any) {
  // Use Clerk middleware
  app.use(clerkMiddleware());
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const { userId, sessionId } = getAuth(req);

  if (!userId) {
    throw new ForbiddenError("Not authenticated");
  }

  // Store userId in request for later use
  (req as any).userId = userId;
  next();
}

export async function syncUserWithDatabase(req: Request, res: Response, next: NextFunction) {
  const { userId, sessionId } = getAuth(req);

  if (!userId) {
    return next();
  }

  try {
    // Get user info from Clerk (if needed)
    // For now, just ensure user exists in database
    const existingUser = await db.getUserByOpenId(userId);

    if (!existingUser) {
      await db.upsertUser({
        openId: userId,
        name: null,
        email: null,
        loginMethod: "clerk",
        lastSignedIn: new Date(),
      });
    } else {
      // Update last signed in
      await db.db
        .update(db.schema.users)
        .set({ lastSignedIn: new Date() })
        .where(db.eq(db.schema.users.openId, userId));
    }

    (req as any).userId = userId;
  } catch (error) {
    console.error("[Clerk] Sync failed:", error);
  }

  next();
}

export async function createSessionToken(userId: string): Promise<string> {
  const token = await new SignJWT({ userId, sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1y")
    .sign(jwtSecret);

  return token;
}
