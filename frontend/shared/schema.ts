//import { channel } from "diagnostics_channel";
import { z } from "zod";

// Spring Boot API schema
export const springLeadSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  stage: z.string().default("Intake"),
  source: z.string().default("Paid"),
  assignedTo: z.string().default("Unassigned"),
  status : z.string().default("New"),
  notes: z.string().optional().default(""),
  action : z.string().default("New"),
  //channel: z.string().default(""),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  course: z.string().optional().default(""),
  dateAdded: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  createdBy: z.string().optional().default(""),
  updatedBy: z.string().optional().default("")
});

// Schema for creating a lead from the frontend form
export const createLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  stage: z.string().default("Intake"),
  source: z.string().default("Direct"),
  assignedTo: z.string().default("Unassigned"),
  notes: z.string().optional().default(""),
  course: z.string().optional().default("")
});

// Modified schema for frontend display
export const leadDisplaySchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string(),
  stage: z.string(),
  source: z.string(),
  assignedTo: z.string(),
  //channel: z.string().optional().default("Email"),
  status: z.string().optional().default("Inactive"),
  dateAdded: z.date().or(z.string()),
  action: z.string().optional().default("Complete form"),
  notes: z.string().optional(),
  course: z.string().optional()
});

// Legacy schemas required for server compatibility
export const users = {
  $inferSelect: z.object({
    id: z.number(),
    username: z.string(),
    password: z.string()
  })
};

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string()
});

// Type definitions
export type SpringLead = z.infer<typeof springLeadSchema>;
export type CreateLead = z.infer<typeof createLeadSchema>;
export type Lead = z.infer<typeof leadDisplaySchema>;
export type User = z.infer<typeof users.$inferSelect>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UpdateLead = Partial<CreateLead>;
