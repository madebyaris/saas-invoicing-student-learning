export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
