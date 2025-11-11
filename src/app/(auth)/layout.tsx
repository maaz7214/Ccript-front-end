import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Banner */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-50 overflow-hidden">
        <Image
          src="/login-banner.png"
          alt="Authentication Banner"
          width={700}
          height={700}
          className="w-full h-screen object-fill"
          priority
          unoptimized
        />
      </div>
      
      {/* Right side - Auth Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl px-8">
          {children}
        </div>
      </div>
    </div>
  );
}