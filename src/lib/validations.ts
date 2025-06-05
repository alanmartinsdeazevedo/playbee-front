import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  phone: z.optional(z.string().min(10, "Telefone deve ter pelo menos 10 dígitos")),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export const ReservationSchema = z.object({
  courtId: z.string().min(1, "Selecione uma quadra"),
  date: z.string().min(1, "Selecione uma data"),
  startTime: z.string().min(1, "Selecione o horário de início"),
  endTime: z.string().min(1, "Selecione o horário de término"),
  playerName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  notes: z.optional(z.string()),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.optional(z.string().min(10, "Telefone deve ter pelo menos 10 dígitos")),
  currentPassword: z.optional(z.string()),
  newPassword: z.optional(z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres")),
  confirmNewPassword: z.optional(z.string()),
}).refine((data) => {
  if (data.newPassword) {
    return data.newPassword === data.confirmNewPassword;
  }
  return true;
}, {
  message: "Novas senhas não coincidem",
  path: ["confirmNewPassword"],
});

export const CourtSchema = z.object({
  name: z.string().min(2, "Nome da quadra deve ter pelo menos 2 caracteres"),
  type: z.enum(["FOOTBALL", "BASKETBALL", "TENNIS", "VOLLEYBALL"], {
    errorMap: () => ({ message: "Tipo de quadra inválido" }),
  }),
  description: z.optional(z.string()),
  pricePerHour: z.number().positive("Preço deve ser positivo"),
  amenities: z.array(z.string()),
  available: z.boolean().default(true),
});