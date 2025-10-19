import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const damageItemSchema = z.object({
  itemName: z.string(),
  itemType: z.string().optional(),
  severity: z.enum(["low", "moderate", "high"]),
  description: z.string(),
  estimatedImpact: z.string().optional(),
});

export const analysisSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  summary: z.string(),
  totalItems: z.number(),
  severityCounts: z.object({
    low: z.number(),
    moderate: z.number(),
    high: z.number(),
  }),
  damageItems: z.array(damageItemSchema),
  overallSeverity: z.enum(["low", "moderate", "high"]),
  description: z.string().optional(),
});

export const insertAnalysisSchema = analysisSchema.omit({ id: true, timestamp: true });

export type DamageItem = z.infer<typeof damageItemSchema>;
export type Analysis = z.infer<typeof analysisSchema>;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
