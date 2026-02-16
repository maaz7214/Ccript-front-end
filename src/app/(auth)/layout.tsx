
import React from 'react'
import Image from 'next/image'
import loginImage from '../../../public/bannerNeura.png'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className='grid grid-cols-1 md:grid-cols-2 3xl:grid-cols-1 3xl:max-w-7xl  h-screen overflow-hidden bg-white dark:bg-background'>
            <div className='md:block 3xl:hidden hidden relative w-full h-full overflow-hidden '>
                <Image
                    src={loginImage}
                    alt="auth image"
                    className='object-fill w-full h-full py-[18px] px-6 rounded-[30px]'
                    fill
                />
                <div className='absolute bottom-[46px] left-14'>
                    <h1 className='text-white text-[40px] font-semibold'>CCript</h1>
                    <p className='text-white text-2xl font-normal'>AI Estimation Dashboard</p>
                </div>
            </div>
            <section className='col-span-1 overflow-y-auto flex flex-col min-h-screen'>
                <div className='flex-1 flex items-center justify-center'>
                    {children}
                </div>
                <p className="text-center text-sm text-muted-foreground pb-8">
                    © CCript. All rights reserved.
                </p>
            </section>
        </main>
    )
}

export default AuthLayout