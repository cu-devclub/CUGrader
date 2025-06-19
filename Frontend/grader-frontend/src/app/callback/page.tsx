'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Callback() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [error, setError] = useState<string>('')

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get the authorization code from URL params
                const credential = searchParams.get('credential')
                const key = searchParams.get('key')
                const errorParam = searchParams.get('error')

                // Check for OAuth errors first
                if (errorParam) {
                    throw new Error(`OAuth error: ${errorParam}`)
                }

                if (!credential) {
                    throw new Error('Authorization credential not found in callback URL')
                }

                console.log('Processing OAuth callback with credential:', credential.substring(0, 10) + '...')

                // Call our Next.js API route which handles the backend communication
                const response = await fetch(`/api/auth/callback?credential=${encodeURIComponent(credential)}&key=${encodeURIComponent(key || '')}`, {
                    method: 'GET',
                    credentials: 'include', // Include cookies in the request
                })

                // The API route handles redirects, so if we get here, something went wrong
                if (!response.ok) {
                    throw new Error(`Authentication failed: ${response.status} ${response.statusText}`)
                }

                // If successful, the API route would have redirected us
                // If we reach here, show success and redirect manually
                setStatus('success')
                setTimeout(() => {
                    router.push('/instructor')
                }, 1500)

            } catch (err) {
                console.error('Auth callback error:', err)

                let errorMessage = 'Authentication failed'
                if (err instanceof Error) {
                    errorMessage = err.message
                }

                setError(errorMessage)
                setStatus('error')

                // Redirect to login page after error
                setTimeout(() => {
                    router.push('/login?error=' + encodeURIComponent(errorMessage))
                }, 3000)
            }
        }

        handleCallback()
    }, [searchParams, router])

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold">Authenticating...</h2>
                    <p className="text-muted-foreground">Please wait while we process your login</p>
                </div>
            </div>
        )
    }

    if (status === 'success') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-green-500 text-5xl mb-4">✓</div>
                    <h2 className="text-xl font-semibold text-green-600">Login Successful!</h2>
                    <p className="text-muted-foreground">Redirecting to dashboard...</p>
                </div>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-500 text-5xl mb-4">✗</div>
                    <h2 className="text-xl font-semibold text-red-600">Authentication Failed</h2>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <p className="text-sm text-muted-foreground">Redirecting to login page...</p>
                </div>
            </div>
        )
    }

    return null
}