// import Image from 'next/image';

// interface AuthLayoutProps {
//   children: React.ReactNode;
// }

// export default function AuthLayout({ children }: AuthLayoutProps) {
//   return (
//     <div className="min-h-screen 2xl:container 2xl:mx-auto flex">
//       {/* Left side - Banner */}
//       <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
//         <Image
//           src="/bannerTumlinson.png"
//           alt="Authentication Banner"
//           width={500}
//           height={700}
//           className="w-full h-screen object-fill"
//           priority
//           unoptimized
//         />
//       </div>
      
//       {/* Right side - Auth Content */}
//       <div className="w-full lg:w-1/2 flex flex-col min-h-screen bg-background py-12 sm:px-6 lg:px-8">
//         <div className="flex-1 flex items-center justify-center">
//           <div className="w-full max-w-xl px-8">
//             {children}
//           </div>
//         </div>
//         <p className="text-center text-sm text-muted-foreground pb-4">
//           © Tumlinson Electric. All rights reserved.
//         </p>
//       </div>
//     </div>
//   );
// }
import React from 'react'
import Image from 'next/image'
import loginImage from '../../../public/bannerTumlinson.png'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className='grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-1 2xl:max-w-7xl mx-auto h-screen overflow-hidden bg-white dark:bg-background'>
            <div className='md:block 2xl:hidden hidden relative h-full overflow-hidden '>
                <Image
                    src={loginImage}
                    alt="auth image"
                    className='object-fill w-full h-full py-[18px] px-6 rounded-[30px]'
                    fill
                />
                <div className='absolute bottom-[46px] left-14 '>
                    <h1 className='text-white text-[40px] font-semibold'>Tumlinson Electric</h1>
                    <p className='text-white text-2xl font-normal'>AI Estimation Dashboard</p>
                </div>
            </div>
            <section className='col-span-1 overflow-y-auto flex flex-col min-h-screen'>
                <div className='flex-1 flex items-center justify-center'>
                    {children}
                </div>
                <p className="text-center text-sm text-muted-foreground pb-8">
                    © Tumlinson Electric. All rights reserved.
                </p>
            </section>
        </main>
    )
}

export default AuthLayout