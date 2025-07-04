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
  userId: z.string().min(1, 'Selecione um usuário'),
  dataHoraInicio: z.date(),
  dataHoraFim: z.date(),
  status: z.string().min(1, 'Status é obrigatório'),
  notes: z.string().optional(),
}).refine((data) => data.dataHoraFim > data.dataHoraInicio, {
  message: "Horário de fim deve ser posterior ao início",
  path: ["dataHoraFim"],
}).refine((data) => {
  // Verificar se horário de início é em hora fechada
  return data.dataHoraInicio.getMinutes() === 0 && 
         data.dataHoraInicio.getSeconds() === 0 && 
         data.dataHoraInicio.getMilliseconds() === 0;
}, {
  message: "Horário de início deve ser em hora fechada (ex: 09:00, 10:00, 11:00...)",
  path: ["dataHoraInicio"],
}).refine((data) => {
  // Verificar se horário de fim é em hora fechada
  return data.dataHoraFim.getMinutes() === 0 && 
         data.dataHoraFim.getSeconds() === 0 && 
         data.dataHoraFim.getMilliseconds() === 0;
}, {
  message: "Horário de fim deve ser em hora fechada (ex: 09:00, 10:00, 11:00...)",
  path: ["dataHoraFim"],
}).refine((data) => {
  // Verificar se a duração é um número inteiro de horas
  const diffMs = data.dataHoraFim.getTime() - data.dataHoraInicio.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  return hours >= 1 && hours <= 8 && hours % 1 === 0;
}, {
  message: "A duração deve ser em horas fechadas, mínimo 1 hora e máximo 8 horas",
  path: ["dataHoraFim"],
});