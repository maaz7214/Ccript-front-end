import { LoginForm } from '@/features/auth';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Banner */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-50 overflow-hidden">
        <Image
          src="/login-banner.png"
          alt="Login Banner"
          width={700}
          height={900}
          className="w-screen h-screen object-cover"
          priority
          unoptimized
        />
      </div>
      
      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background py-12  sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
