import { z } from "zod"

export const authSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email("Please enter a valid email"),
  password: z.string().optional(),
})

export type AuthInput = z.infer<typeof authSchema>
