export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
}

// Enum para status de usuário
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

// Interface principal do usuário
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole | 'USER' | 'ADMIN' | 'MANAGER';
  status?: UserStatus | 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  avatar?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

// Dados de perfil estendidos
export interface UserProfile extends User {
  dateOfBirth?: string;
  cpf?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    favoriteCourtTypes: string[];
    preferredTimes: string[];
  };
  stats?: {
    totalReservations: number;
    canceledReservations: number;
    favoriteCourtId?: string;
    memberSince: string;
  };
}

// Resposta do login
export interface LoginResponse {
  success?: string;
  error?: string;
  twoFactor?: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
}

// Resposta do registro
export interface RegisterResponse {
  success?: string;
  error?: string;
  user?: User;
  requiresVerification?: boolean;
}

// Dados para login
export interface LoginRequest {
  email: string;
  password: string;
  code?: string; // Para 2FA
  rememberMe?: boolean;
}

// Dados para registro
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  acceptTerms: boolean;
}

// Dados para reset de senha
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// Dados para mudança de senha
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Dados para atualização de perfil
export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

// Token JWT decodificado
export interface JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
  jti?: string;
}

// Contexto de autenticação
export interface AuthContext {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<{ success?: string; error?: string }>;
  changePassword: (data: ChangePasswordRequest) => Promise<{ success?: string; error?: string }>;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Estados de autenticação
export enum AuthState {
  IDLE = 'idle',
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  ERROR = 'error',
}

export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: { error: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: { user: User } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: { loading: boolean } };

// Estado do reducer de autenticação
export interface AuthReducerState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  state: AuthState;
}

// Permissões do sistema
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

// Dados de sessão
export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: string;
  userAgent?: string;
  ipAddress?: string;
  isActive: boolean;
}

// Dados para verificação de email
export interface EmailVerificationRequest {
  token: string;
}

export interface EmailVerificationResponse {
  success?: string;
  error?: string;
  user?: User;
}

// Dados para reenvio de verificação
export interface ResendVerificationRequest {
  email: string;
}

// OAuth providers
export enum OAuthProvider {
  GOOGLE = 'google',
}

// Dados para OAuth
export interface OAuthRequest {
  provider: OAuthProvider;
  code: string;
  state?: string;
  redirectUri: string;
}

export interface OAuthResponse {
  success?: string;
  error?: string;
  user?: User;
  token?: string;
  isNewUser?: boolean;
}

// Auditoria de login
export interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  timestamp: string;
  location?: {
    country: string;
    city: string;
  };
}

// Configurações de segurança do usuário
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  passwordLastChanged: string;
  activeSessions: number;
  recentLoginAttempts: LoginAttempt[];
}

// Tipos utilitários
export type AuthUser = Pick<User, 'id' | 'name' | 'email' | 'role'>;
export type PublicUser = Omit<User, 'email' | 'phone'>;
export type UserWithoutDates = Omit<User, 'createdAt' | 'updatedAt' | 'lastLoginAt'>;

// Guards de tipo para verificação de role
export const isAdmin = (user: User): boolean => {
  return user.role === UserRole.ADMIN || user.role === 'ADMIN';
};

export const isManager = (user: User): boolean => {
  return user.role === UserRole.MANAGER || user.role === 'MANAGER' || isAdmin(user);
};

export const isUser = (user: User): boolean => {
  return user.role === UserRole.USER || user.role === 'USER';
};

// Verificar de permissões
export const hasPermission = (user: User, requiredRole: UserRole): boolean => {
  const roleHierarchy = {
    [UserRole.USER]: 1,
    [UserRole.MANAGER]: 2,
    [UserRole.ADMIN]: 3,
  };

  const userRoleLevel = roleHierarchy[user.role as UserRole] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

  return userRoleLevel >= requiredRoleLevel;
};

// Verificar status ativo
export const isActiveUser = (user: User): boolean => {
  return !user.status || user.status === UserStatus.ACTIVE || user.status === 'ACTIVE';
};

// Mascarar email (para exibição)
export const maskEmail = (email: string): string => {
  const [username, domain] = email.split('@');
  if (username.length <= 2) return email;
  
  const maskedUsername = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1];
  return `${maskedUsername}@${domain}`;
};

// Constantes
export const TOKEN_STORAGE_KEY = 'auth-token';
export const USER_STORAGE_KEY = 'user-data';
export const REFRESH_TOKEN_STORAGE_KEY = 'refresh-token';

export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 128;

export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hr
export const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 min