export interface Profile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  birth_year: string | null;
  gender: string | null;
  agree_terms: boolean;
  agree_ai: boolean;
  agree_marketing: boolean;
  role: "user" | "admin" | "moderator";
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileRequest {
  id: string;
  email: string;
  name: string;
  phone?: string;
  birthYear?: string;
  gender?: string;
  agreeTerms: boolean;
  agreeAI: boolean;
  agreeMarketing: boolean;
  role?: "user" | "admin" | "moderator";
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  birthYear?: string;
  gender?: string;
  agreeMarketing?: boolean;
  role?: "user" | "admin" | "moderator";
  isActive?: boolean;
  lastLoginAt?: string;
}
