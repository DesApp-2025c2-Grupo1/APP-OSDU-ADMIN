export interface AdminUser {
  id: string | number;
  email: string;
  role: string;
  debeCambiarPassword?: boolean;
}

export interface SessionResponse {
  user?: AdminUser;
}

export function login(email: string, password: string): Promise<SessionResponse>;
export function getSession(): Promise<SessionResponse>;
export function logout(): Promise<{ message: string }>;
export function getAffiliates(activo?: string): Promise<unknown>;
export function activateAffiliate(id: string | number): Promise<unknown>;
export function deactivateAffiliate(id: string | number): Promise<unknown>;
export function getApiErrorMessage(error: unknown): string;
