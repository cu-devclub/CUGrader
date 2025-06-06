import React from 'react'
import { LoginForm } from "@/components/login-form"
export default function page() {
    return (
        <div className="login-bg-2 flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                <LoginForm />
            </div>
        </div>
    )
}
