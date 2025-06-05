"use server";

import type * as z from "zod";
import { LoginSchema, RegisterSchema } from "@/lib/validations";
import { apiClient } from "@/lib/api";
import type { LoginResponse, User } from "@/types/auth";
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

  const { email, password, code } = validatedFields.data;

  try {
    
    // mock de autenticação
    if (email === "admin@playbee.com" && password === "123456") {
      const mockUser: User = {
        id: "1",
        name: "Administrador",
        email: "admin@playbee.com",
        role: "ADMIN",
        phone: "(84) 99999-9999"
      };

      // mock token JWT
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token";

      cookies().set("auth-token", mockToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      });

      cookies().set("user-data", JSON.stringify(mockUser), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      });

      return { 
        success: "Login realizado com sucesso!", 
        user: mockUser, 
        token: mockToken 
      };
    }

    if (email === "user@playbee.com" && password === "123456") {
      // mock usuário comum
      const mockUser: User = {
        id: "2",
        name: "João Silva",
        email: "user@playbee.com",
        role: "USER",
        phone: "(84) 98888-8888"
      };

      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.user.token";

      cookies().set("auth-token", mockToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      cookies().set("user-data", JSON.stringify(mockUser), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      return { 
        success: "Login realizado com sucesso!", 
        user: mockUser, 
        token: mockToken 
      };
    }

    return { error: "Email ou senha incorretos!" };

    /* 
    // Aguardando backend estar pronto:
    
    const response = await apiClient.post<LoginResponse>("/auth/login", {
      email,
      password,
      code,
    });

    if (response.error) {
      return { error: response.error };
    }

    if (response.success && response.token) {
      cookies().set("auth-token", response.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      });

      if (response.user) {
        cookies().set("user-data", JSON.stringify(response.user), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        });
      }

      return { success: response.success, user: response.user, token: response.token };
    }

    return { error: "Resposta inesperada do servidor" };
    */

  } catch (error) {
    console.error("Login error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        return { error: "Credenciais inválidas!" };
      }
      if (error.message.includes("403")) {
        return { error: "Conta não verificada. Verifique seu email!" };
      }
      if (error.message.includes("500")) {
        return { error: "Erro no servidor. Tente novamente mais tarde." };
      }
    }

    return { error: "Falha no login. Tente novamente." };
  }
};

export const logout = async () => {
  try {
    // Remover cookies de autenticação
    cookies().delete("auth-token");
    cookies().delete("user-data");

    // TODO: Endpoint de logout
    // await apiClient.post("/auth/logout", {});

    return { success: "Logout realizado com sucesso!" };
  } catch (error) {
    console.error("Logout error:", error);
    return { error: "Erro ao fazer logout" };
  } finally {
    redirect("/login");
  }
};

export const register = async (
  values: z.infer<typeof RegisterSchema>
): Promise<{ success?: string; error?: string; user?: User }> => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Dados inválidos!" };
  }

  const { name, email, password, phone } = validatedFields.data;

  try {
    if (email === "admin@playbee.com" || email === "user@playbee.com") {
      return { error: "Este email já está cadastrado!" };
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      role: "USER",
    };

    return { 
      success: "Conta criada com sucesso! Verifique seu email.", 
      user: newUser 
    };

  } catch (error) {
    console.error("Register error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("409")) {
        return { error: "Email já está em uso!" };
      }
      if (error.message.includes("400")) {
        return { error: "Dados inválidos!" };
      }
    }
    
    return { error: "Erro ao criar conta. Tente novamente." };
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

    return { user };

  } catch (error) {
    console.error("Get current user error:", error);
    return { error: "Erro ao obter dados do usuário" };
  }
};

export const refreshToken = async (): Promise<{ token?: string; error?: string }> => {
  try {
    const currentToken = cookies().get("auth-token")?.value;

    if (!currentToken) {
      return { error: "Token não encontrado" };
    }

    // const response = await apiClient.post<{ token: string }>("/auth/refresh", {
    //   token: currentToken,
    // });

    const newToken = `refreshed.${currentToken}`;

    cookies().set("auth-token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { token: newToken };

  } catch (error) {
    console.error("Refresh token error:", error);
    return { error: "Erro ao renovar token" };
  }
};