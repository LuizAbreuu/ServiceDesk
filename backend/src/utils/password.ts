import { z } from "zod";

export const STRONG_PASSWORD_REQUIREMENTS = [
  "Pelo menos 8 caracteres",
  "Uma letra maiuscula",
  "Uma letra minuscula",
  "Um numero",
  "Um caractere especial",
] as const;

export const strongPasswordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .regex(/[A-Z]/, "A senha deve incluir ao menos uma letra maiuscula")
  .regex(/[a-z]/, "A senha deve incluir ao menos uma letra minuscula")
  .regex(/[0-9]/, "A senha deve incluir ao menos um numero")
  .regex(/[^A-Za-z0-9]/, "A senha deve incluir ao menos um caractere especial");

export function isStrongPassword(password: string) {
  return strongPasswordSchema.safeParse(password).success;
}
