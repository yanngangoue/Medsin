import { z } from "zod";

export const sendMessageSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1, "Message requis").max(4000),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

/** @deprecated Utiliser `lib/schemas/clinical` */
export { patchEligibilitySchema } from "@/lib/schemas/clinical";