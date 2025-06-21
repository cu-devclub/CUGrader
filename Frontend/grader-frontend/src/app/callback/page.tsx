'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Types
type CallbackStatus = 'loading' | 'success' | 'error';

// Components
function LoadingState() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold">Authenticating...</h2>
                <p className="text-muted-foreground">Please wait while we process your login</p>
            </div>
        </div>
    );
}

function SuccessState() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="text-green-500 text-5xl mb-4">✓</div>
                <h2 className="text-xl font-semibold text-green-600">Login Successful!</h2>
                <p className="text-muted-foreground">Redirecting to dashboard...</p>
            </div>
        </div>
    );
}

function ErrorState({ error }: { error: string }) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="text-red-500 text-5xl mb-4">✗</div>
                <h2 className="text-xl font-semibold text-red-600">Authentication Failed</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <p className="text-sm text-muted-foreground">Redirecting to login page...</p>
            </div>
        </div>
    );
}

// Helper functions
function validateCallbackParams(searchParams: URLSearchParams) {
    const errorParam = searchParams.get('error');
    if (errorParam) {
        throw new Error(`OAuth error: ${errorParam}`);
    }

    const credential = searchParams.get('credential');
    if (!credential) {
        throw new Error('Authorization credential not found in callback URL');
    }

    return {
        credential,
        key: searchParams.get('key')
    };
}

async function callAuthAPI(credential: string, key: string | null): Promise<Response> {
    const params = new URLSearchParams({
        credential,
        ...(key && { key })
    });

    return fetch(`/api/auth/callback?${params}`, {
        method: 'GET',
        credentials: 'include',
    });
}

export default function Callback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<CallbackStatus>('loading');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Validate URL parameters
                const { credential, key } = validateCallbackParams(searchParams);

                console.log('Processing OAuth callback...');

                // Call authentication API
                const response = await callAuthAPI(credential, key);
                const data = await response.json();

                console.log('Auth API response:', response.status, data);

                if (!response.ok || !data.success) {
                    throw new Error(data.error || `Authentication failed: ${response.status}`);
                }

                // On success, redirect to the URL provided by the API
                setStatus('success');
                console.log('Redirecting to:', data.redirectTo);
                router.push(data.redirectTo);


            } catch (err) {
                console.error('Auth callback error:', err);

                const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
                setError(errorMessage);
                setStatus('error');

                // Redirect to login with error after delay
                setTimeout(() => {
                    router.push(`/login?error=${encodeURIComponent(errorMessage)}`);
                }, 3000);
            }
        };

        handleCallback();
    }, [searchParams, router]);

    // Render based on status
    switch (status) {
        case 'loading':
            return <LoadingState />;
        case 'success':
            return <SuccessState />;
        case 'error':
            return <ErrorState error={error} />;
        default:
            return null;
    }
}