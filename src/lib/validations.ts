import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const RegisterSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmarSenha: z.string(),
  telefone: z.string().optional(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "Senhas não coincidem",
  path: ["confirmarSenha"],
});

export const CreateReservationSchema = z.object({
  courtId: z.string().min(1, 'Selecione uma quadra'),
  date: z.string().min(1, 'Selecione uma data'),
  startTime: z.string().min(1, 'Selecione um horário'),
  duration: z.number().min(1, 'Duração mínima é 1 hora').max(8, 'Duração máxima é 8 horas'),
  notes: z.string().optional(),
});