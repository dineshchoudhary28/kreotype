import { z } from "zod/v4";

export const sendRequestSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

export const handleRequestSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  action: z.enum(["accept", "reject"]),
});

export type SendRequestInput = z.infer<typeof sendRequestSchema>;
export type HandleRequestInput = z.infer<typeof handleRequestSchema>;
