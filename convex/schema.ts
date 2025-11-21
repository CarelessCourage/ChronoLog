import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  buttonSyncSessions: defineTable({
    sessionId: v.string(),
    userPressed: v.boolean(),
    helperPressed: v.boolean(),
    userPressedAt: v.optional(v.number()),
    helperPressedAt: v.optional(v.number()),
    status: v.union(
      v.literal("waiting"),
      v.literal("success"),
      v.literal("failed_timeout"),
      v.literal("failed_not_simultaneous")
    ),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_sessionId", ["sessionId"]),
});
