import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate a random 6-character session ID
function generateSessionId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding confusing characters
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a new button sync session
export const createSession = mutation({
  args: {},
  handler: async (ctx) => {
    const sessionId = generateSessionId();
    const now = Date.now();
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes from now

    await ctx.db.insert("buttonSyncSessions", {
      sessionId,
      userPressed: false,
      helperPressed: false,
      status: "waiting",
      createdAt: now,
      expiresAt,
    });

    return { sessionId };
  },
});

// Press the button (either as user or helper)
export const pressButton = mutation({
  args: {
    sessionId: v.string(),
    role: v.union(v.literal("user"), v.literal("helper")),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("buttonSyncSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.status !== "waiting") {
      throw new Error("Session is no longer active");
    }

    if (Date.now() > session.expiresAt) {
      await ctx.db.patch(session._id, { status: "failed_timeout" });
      throw new Error("Session has expired");
    }

    const now = Date.now();
    const updates: any = {};

    if (args.role === "user") {
      updates.userPressed = true;
      updates.userPressedAt = now;
    } else {
      updates.helperPressed = true;
      updates.helperPressedAt = now;
    }

    // Check if both have pressed
    const bothPressed =
      (args.role === "user" ? true : session.userPressed) &&
      (args.role === "helper" ? true : session.helperPressed);

    if (bothPressed) {
      const userTime = args.role === "user" ? now : session.userPressedAt!;
      const helperTime = args.role === "helper" ? now : session.helperPressedAt!;
      const timeDiff = Math.abs(userTime - helperTime);

      // Must be pressed within 1 second of each other
      if (timeDiff <= 1000) {
        updates.status = "success";
      } else {
        updates.status = "failed_not_simultaneous";
      }
    }

    await ctx.db.patch(session._id, updates);

    return {
      success: updates.status === "success",
      status: updates.status || "waiting",
    };
  },
});

// Get session status
export const getSession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("buttonSyncSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      return null;
    }

    // Check if expired (return modified status, but don't mutate in query)
    if (Date.now() > session.expiresAt && session.status === "waiting") {
      return { ...session, status: "failed_timeout" as const };
    }

    return session;
  },
});

// Reset a failed session to allow retry with same ID
export const resetSession = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("buttonSyncSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(session._id, {
      userPressed: false,
      helperPressed: false,
      userPressedAt: undefined,
      helperPressedAt: undefined,
      status: "waiting",
    });

    return { sessionId: session.sessionId };
  },
});
