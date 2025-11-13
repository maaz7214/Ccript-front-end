'use server';

/**
 * Server Actions for Authentication
 * These functions run on the server and handle authentication-related API calls
 */

import { cookies } from 'next/headers';
import { apiPost, apiEndpoints } from '@/lib/api';
import { LoginRequest, LoginResponse } from '@/types/api';

// Action result type for better type safety
export interface AuthActionResult {
  success: boolean;
  message?: string;
  errors?: { [key: string]: string };
  redirectTo?: string;
  token?: string;
  user?: any;
}

/**
 * Server action for user login
 * @param formData - FormData containing email and password
 * @returns AuthActionResult with success status and any errors
 */
export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  try {
    // Extract and validate form data
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Basic validation
    const errors: { [key: string]: string } = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        errors,
      };
    }

    // Prepare login request - send username (email) and password to API
    const loginData: LoginRequest = {
      username: email, // API expects username field, we'll send the email as username
      password,
    };
    console.log('Login data prepared:', loginData);
    
    // Make API call to login endpoint
    const response = await apiPost<LoginResponse>(
      apiEndpoints.auth.login,
      loginData
    );
    
    console.log('API Response received:', response);

    // Check if login was successful - your API returns access_token directly
    if (!response.access_token) {
      return {
        success: false,
        message: 'Login failed. No access token received.',
      };
    }

    // Store authentication token in httpOnly cookies for security
    const cookieStore = await cookies();
    cookieStore.set('auth-token', response.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    // Store user info (optional, for client-side access)
    if (response.user) {
      cookieStore.set('user-info', JSON.stringify({
        id: response.user.id,
        email: response.user.email,
        username: response.user.username,
        full_name: response.user.full_name,
        is_active: response.user.is_active,
        is_superuser: response.user.is_superuser,
      }), {
        httpOnly: false, // Allow client-side access for user info
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60,
        path: '/',
      });
    }

    return {
      success: true,
      message: 'Login successful!',
      redirectTo: '/dashboard', // Redirect to dashboard after successful login
      token: response.access_token, // Return token for localStorage storage
      user: response.user, // Return user info for localStorage storage
    };

  } catch (error) {
    console.error('Login action error:', error);
    
    // Handle different types of errors
    let errorMessage = 'An unexpected error occurred during login';
    
    if (error instanceof Error) {
      // Check if it's an API error with a specific message
      if (error.message.includes('HTTP 401') || error.message.includes('Unauthorized')) {
        errorMessage = 'Invalid email or password';
      } else if (error.message.includes('HTTP 422') || error.message.includes('Validation')) {
        errorMessage = 'Please check your input and try again';
      } else if (error.message.includes('HTTP 500')) {
        errorMessage = 'Server error. Please try again later';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * Server action for user logout
 * @returns AuthActionResult with success status
 */
export async function logoutAction(): Promise<AuthActionResult> {
  try {
    const cookieStore = await cookies();
    
    // Clear all authentication cookies
    cookieStore.delete('auth-token');
    cookieStore.delete('refresh-token');
    cookieStore.delete('user-info');

    return {
      success: true,
      message: 'Logged out successfully',
      redirectTo: '/login',
    };
  } catch (error) {
    console.error('Logout action error:', error);
    return {
      success: false,
      message: 'An error occurred during logout',
    };
  }
}

/**
 * Utility function to get user info from cookies
 * @returns User info or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const userInfo = cookieStore.get('user-info')?.value;
    const authToken = cookieStore.get('auth-token')?.value;

    if (!userInfo || !authToken) {
      return null;
    }

    return JSON.parse(userInfo);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Utility function to check if user is authenticated
 * @returns boolean indicating authentication status
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;
  return !!authToken;
}