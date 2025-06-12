'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Callback() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [error, setError] = useState<string>('')
    const [Credential, setCredential] = useState<string>('')

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get authorization credential from URL params
                const credential = searchParams.get('credential')
                setCredential(credential || '')

                if (!credential) {
                    throw new Error('Authorization credential not found')
                }

                console.log('Sending credential to backend:', credential.substring(0, 20) + '...')

                // Send credentials to backend API with additional options
                const response = await fetch('https://appcugrader.sittha.net/v1/callback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        credential,
                    }),
                    // Add these for potential CORS/network issues
                    mode: 'cors',
                    credentials: 'omit',
                })

                console.log('Response status:', response.status)
                console.log('Response headers:', Object.fromEntries(response.headers.entries()))

                if (!response.ok) {
                    let errorMessage = `HTTP error! status: ${response.status}`
                    try {
                        const errorData = await response.json()
                        errorMessage = errorData.message || errorMessage
                    } catch {
                        // If error response is not JSON, use status text
                        errorMessage = response.statusText || errorMessage
                    }
                    throw new Error(errorMessage)
                }

                const data = await response.json()
                console.log('Response data:', data)

                // Store JWT token
                if (data.token) {
                    localStorage.setItem('auth_token', data.token)

                    // Optionally store user data
                    if (data.user) {
                        localStorage.setItem('user_data', JSON.stringify(data.user))
                    }

                    setStatus('success')

                    // Redirect to dashboard or home page
                    setTimeout(() => {
                        router.push('/dashboard')
                    }, 1500)
                } else {
                    throw new Error('No token received from server')
                }

            } catch (err) {
                console.error('Auth callback error:', err)

                // More specific error messages
                let errorMessage = 'Unknown error occurred'
                if (err instanceof TypeError && err.message === 'Failed to fetch') {
                    errorMessage = 'Network error: Cannot connect to authentication server. Please check your internet connection.'
                } else if (err instanceof Error) {
                    errorMessage = err.message
                }

                setError(errorMessage)
                setStatus('error')

                // Redirect to login page after error
                /*
                setTimeout(() => {
                    router.push('/')
                }, 5000)
                */
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
                    <p className="text-muted-foreground">Please wait while we log you in</p>
                    <p className="text-sm text-muted-foreground">logging in as {Credential}</p>
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
                    <p className="text-sm text-muted-foreground">logging in as {Credential}</p>
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
                    <p className="text-sm text-muted-foreground mt-2">Attempted logging in as {Credential}</p>
                </div>
            </div>
        )
    }

    return null
}