//import { channel } from "diagnostics_channel";
import { z } from "zod";

// Spring Boot API schema
export const springLeadSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  stage: z.string().default("Intake"),
  source: z.string().default("Walk-ins"),
  channel: z.string().default("Walk-ins"),
  assignedTo: z.string().default("Unassigned"),
  status : z.string().default("New"),
  notes: z.string().optional().default(""),
  action : z.string().default("New"),
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
  channel: z.string().default("Walk-ins"),
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
  channel: z.string(),
  assignedTo: z.string(),
  status: z.string().optional().default("Inactive"),
  dateAdded: z.date().or(z.string()),
  action: z.string().optional().default("Complete form"),
  notes: z.string().optional(),
  course: z.string().optional()
});

// Schema for creating a walk-in lead from the frontend form
export const createWalkinLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  stage: z.string().default("Intake"),
  channel: z.string().default("Walk-ins"),
  assignedTo: z.string().default("Unassigned"),
  notes: z.string().optional().default(""),
  course: z.string().optional().default(""),
  fatherName: z.string().min(1, "Father's name is required"),
  motherName: z.string().min(1, "Mother's name is required"),
  fatherPhoneNumber: z.string().min(1, "Father's phone number is required"),
  motherPhoneNumber: z.string().min(1, "Mother's phone number is required"),
  address: z.string().min(1, "Address is required"),
  previousInstitution: z.string().min(1, "Previous institution is required"),
  marksObtained: z.string().min(1, "Marks obtained is required"),
  type: z.literal("walkin")
});

// Modified schema for walk-in lead display
export const walkinLeadDisplaySchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string(),
  stage: z.string(),
  channel: z.string(),
  assignedTo: z.string(),
  status: z.string().optional().default("Inactive"),
  dateAdded: z.date().or(z.string()),
  action: z.string().optional().default("Complete form"),
  notes: z.string().optional(),
  course: z.string().optional(),
  fatherName: z.string(),
  motherName: z.string(),
  fatherPhoneNumber: z.string(),
  motherPhoneNumber: z.string(),
  address: z.string(),
  previousInstitution: z.string(),
  marksObtained: z.string(),
  type: z.literal("walkin")
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
export type CreateWalkinLead = z.infer<typeof createWalkinLeadSchema>;
export type WalkinLead = z.infer<typeof walkinLeadDisplaySchema>;
export type User = z.infer<typeof users.$inferSelect>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UpdateLead = Partial<CreateLead>;
export type UpdateWalkinLead = Partial<CreateWalkinLead>;
