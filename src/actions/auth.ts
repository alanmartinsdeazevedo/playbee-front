"use server";

import type * as z from "zod";
import { LoginSchema, RegisterSchema } from "@/lib/validations";
import { apiClient } from "@/lib/api";
import type { LoginResponse, User, CreateUserRequest } from "@/types/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const login = async (
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null,
): Promise<LoginResponse> => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Campos inválidos!" };
  }

  const { email, senha } = validatedFields.data;

  try {
    // TODO: Implementar endpoint de login no backend
    // Para agora, vamos simular verificando se o usuário existe
    
    // Buscar usuário por email (quando tiver endpoint de login, substituir)
    const users = await apiClient.get<User[]>("/users");
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return { error: "Usuário não encontrado!" };
    }

    // TODO: Verificar senha quando backend tiver endpoint de login
    // Por enquanto, aceitar qualquer senha
    
    // Simular token JWT
    const mockToken = `jwt.token.for.${user.id}`;

    // Salvar token nos cookies
    cookies().set("auth-token", mockToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    // Salvar dados do usuário (sem senha)
    const userWithoutPassword = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      role: user.role,
    };

    cookies().set("user-data", JSON.stringify(userWithoutPassword), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { 
      success: "Login realizado com sucesso!", 
      user: userWithoutPassword, 
      token: mockToken 
    };

  } catch (error) {
    console.error("Login error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("404")) {
        return { error: "Usuário não encontrado!" };
      }
      if (error.message.includes("500")) {
        return { error: "Erro no servidor. Tente novamente mais tarde." };
      }
      if (error.message.includes("conexão")) {
        return { error: "Erro de conexão com o servidor. Verifique se o backend está rodando." };
      }
    }

    return { error: "Falha no login. Tente novamente." };
  }
};

export const register = async (
  values: z.infer<typeof RegisterSchema>
): Promise<{ success?: string; error?: string; user?: User }> => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Dados inválidos!" };
  }

  const { nome, email, senha, telefone, role } = validatedFields.data;

  try {
    const userData: CreateUserRequest = {
      nome,
      email,
      senha,
      telefone,
      role: role || "USER",
    };

    const newUser = await apiClient.post<User>("/users", userData);

    return { 
      success: "Conta criada com sucesso!", 
      user: newUser 
    };

  } catch (error) {
    console.error("Register error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("409") || error.message.includes("already exists")) {
        return { error: "Email já está em uso!" };
      }
      if (error.message.includes("400") || error.message.includes("validation")) {
        return { error: "Dados inválidos!" };
      }
      if (error.message.includes("conexão")) {
        return { error: "Erro de conexão com o servidor." };
      }
    }
    
    return { error: "Erro ao criar conta. Tente novamente." };
  }
};

export const logout = async () => {
  try {
    cookies().delete("auth-token");
    cookies().delete("user-data");

    return { success: "Logout realizado com sucesso!" };
  } catch (error) {
    console.error("Logout error:", error);
    return { error: "Erro ao fazer logout" };
  } finally {
    redirect("/login");
  }
};

export const getCurrentUser = async (): Promise<{ user?: User; error?: string }> => {
  try {
    const token = cookies().get("auth-token")?.value;
    const userData = cookies().get("user-data")?.value;

    if (!token || !userData) {
      return { error: "Usuário não autenticado" };
    }

    const user: User = JSON.parse(userData);

    // TODO: Validar token com backend quando tiver endpoint
    // const response = await apiClient.get<User>("/auth/me");

    return { user };

  } catch (error) {
    console.error("Get current user error:", error);
    return { error: "Erro ao obter dados do usuário" };
  }
};