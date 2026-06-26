import { z } from "zod";

export const memorySchema = z.object({
  name: z.string().min(1, "Item name is required").max(100, "Name is too long"),
  location: z.string().min(1, "Storage location is required").max(150, "Location is too long"),
  notes: z.string().max(1000, "Notes can be up to 1000 characters").optional().nullable(),
  photoUrl: z.string()
    .optional()
    .nullable()
    .or(z.literal(""))
    .refine((val) => {
      if (!val) return true;
      return val.startsWith("http://") || val.startsWith("https://") || val.startsWith("data:image/");
    }, {
      message: "Must be a valid image URL or uploaded file",
    }),
  categoryId: z.string().min(1, "Category is required"),
  reminderDate: z.string().optional().nullable().or(z.literal("")),
}).refine((data) => {
  if (data.reminderDate) {
    const selectedDate = new Date(data.reminderDate);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }
  return true;
}, {
  message: "Reminder/expiry date cannot be in the past",
  path: ["reminderDate"],
});

export type MemorySchemaType = z.infer<typeof memorySchema>;

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be under 50 characters")
    .regex(/^[a-zA-Z0-9\s-]+$/, "Category name can only contain letters, numbers, spaces, and hyphens"),
});

export type CategorySchemaType = z.infer<typeof categorySchema>;
