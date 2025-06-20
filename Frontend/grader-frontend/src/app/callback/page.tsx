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

                try {
                    // Call our Next.js API route which handles the backend communication
                    const response = await fetch(`/api/auth/callback?credential=${encodeURIComponent(credential)}&key=${encodeURIComponent(key || '')}`, {
                        method: 'GET',
                        credentials: 'include', // Include cookies in the request
                        redirect: 'manual', // Don't follow redirects automatically
                    })

                    console.log('Response status:', response.status, 'Type:', response.type)

                    // Check if we got a redirect response (including opaque redirects)
                    if (response.type === 'opaqueredirect' || response.status === 307 || response.status === 302 || response.status === 301) {
                        console.log('Redirect detected, checking location header')

                        const redirectUrl = response.headers.get('location')
                        if (redirectUrl) {
                            console.log('API route redirected to:', redirectUrl)
                            window.location.href = redirectUrl
                            return
                        } else {
                            // For opaque redirects, we can't see the location header
                            // Let's try following the redirect normally
                            console.log('Opaque redirect detected, refetching with follow')
                            const followResponse = await fetch(`/api/auth/callback?credential=${encodeURIComponent(credential)}&key=${encodeURIComponent(key || '')}`, {
                                method: 'GET',
                                credentials: 'include',
                                redirect: 'follow',
                            })

                            // If this succeeds, we should be on the redirected page
                            // The API sets cookies, so we can check if we're authenticated and redirect appropriately
                            if (followResponse.ok) {
                                // Try to determine where to go based on URL or default to checking auth
                                console.log('Follow response URL:', followResponse.url)
                                window.location.href = followResponse.url
                                return
                            }
                        }
                    }

                    // If we get here without a redirect, something went wrong
                    if (!response.ok) {
                        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`)
                    }

                } catch (fetchError) {
                    console.error('Fetch error:', fetchError)

                    // If manual redirect fails, try with normal redirect handling
                    console.log('Retrying with normal redirect handling')
                    const response = await fetch(`/api/auth/callback?credential=${encodeURIComponent(credential)}&key=${encodeURIComponent(key || '')}`, {
                        method: 'GET',
                        credentials: 'include',
                    })

                    if (!response.ok) {
                        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`)
                    }

                    // If we reach here, the redirect was followed and we should check the URL
                    console.log('Final response URL after redirect:', response.url)

                    // The API route should have set the auth cookie, so redirect based on response URL
                    if (response.url.includes('/student')) {
                        window.location.href = '/student'
                    } else if (response.url.includes('/instructor')) {
                        window.location.href = '/instructor'
                    } else {
                        // Default fallback - let the middleware handle the redirect
                        window.location.href = '/student' // Default for this user
                    }
                    return
                }

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