import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const RegisterSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  role: z.string().default("USER"),
}).refine((data) => data.senha === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});