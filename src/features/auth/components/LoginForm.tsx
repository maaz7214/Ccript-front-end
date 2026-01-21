'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginAction, AuthActionResult } from '../../../app/(main)/_actions/auth';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage('');
    setErrors({});
    
    try {
      // Create FormData for server action
      // Note: API expects username field, server action will map email -> username
      const formDataForAction = new FormData();
      formDataForAction.append('email', formData.email);
      formDataForAction.append('password', formData.password);

      // Call server action
      const result: AuthActionResult = await loginAction(formDataForAction);
      
      if (result.success) {
        setMessage(result.message || 'Login successful!');
        
        // Store token in localStorage for client-side API calls
        if (result.token) {
          localStorage.setItem('authToken', result.token);
        }
        
        // Store user info in localStorage
        if (result.user) {
          localStorage.setItem('currentUser', JSON.stringify(result.user));
        }
        
        // Redirect to dashboard or specified page
        if (result.redirectTo) {
          router.push(result.redirectTo);
        }
      } else {
        // Handle errors from server action
        if (result.errors) {
          setErrors(result.errors);
        }
        if (result.message) {
          setMessage(result.message);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="w-full max-w-[489px] mx-auto">
      <div className="text-left mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-3">Welcome Back</h1>
        <p className="text-lg text-muted-foreground">Sign in to your Account to continue</p>
      </div>
      
      {/* Display success/error message */}
      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.includes('successful') || message.includes('success')
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col" noValidate>
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="email" className="text-base">Email</Label>
          <Input
            id="email"
            name="email"
            type="text"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email ? "border-destructive focus-visible:ring-destructive h-12 text-base rounded-full" : "h-12 text-base rounded-full"}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="password" className="text-base">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? "border-destructive focus-visible:ring-destructive pr-10 h-12 text-base rounded-full" : "pr-10 h-12 text-base rounded-full"}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg 
                  className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              ) : (
                <svg 
                  className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
        </div>
        <Button
        type="submit"
        variant="default"
        size="lg"
        className="w-full gap-x-4 rounded-full bg-[#009689] hover:bg-[#007f75] cursor-pointer h-12 text-base font-semibold"
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
      </div>
          
     
    </form>
    </div>
  );
}