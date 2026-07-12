import { z } from 'zod';

export const passwordRequirements = [
  'Pelo menos 8 caracteres',
  'Uma letra maiúscula',
  'Uma letra minúscula',
  'Um número',
  'Um caractere especial',
] as const;

export const strongPasswordSchema = z
  .string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres')
  .regex(/[A-Z]/, 'A senha deve incluir ao menos uma letra maiúscula')
  .regex(/[a-z]/, 'A senha deve incluir ao menos uma letra minúscula')
  .regex(/[0-9]/, 'A senha deve incluir ao menos um número')
  .regex(/[^A-Za-z0-9]/, 'A senha deve incluir ao menos um caractere especial');

export function passwordRequirementChecks(password: string) {
  return [
    { label: passwordRequirements[0], met: password.length >= 8 },
    { label: passwordRequirements[1], met: /[A-Z]/.test(password) },
    { label: passwordRequirements[2], met: /[a-z]/.test(password) },
    { label: passwordRequirements[3], met: /[0-9]/.test(password) },
    { label: passwordRequirements[4], met: /[^A-Za-z0-9]/.test(password) },
  ];
}
