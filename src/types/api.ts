/**
 * API Types and Interfaces
 * This file contains TypeScript types and interfaces for API requests and responses
 */

// Base API Response interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

// Authentication related types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface User {
  id: string | number;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    token?: string;
  };
  errors?: string[];
}

// Error types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

// Form state types for components
export interface FormErrors {
  [key: string]: string;
}

export interface AuthFormState {
  isLoading: boolean;
  errors: FormErrors;
  success?: boolean;
  message?: string;
}