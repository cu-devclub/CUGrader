// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// This URL should be the one registered with your OAuth provider
// AND the one your backend expects to complete the auth flow.
const USE_TEST_CALLBACK = process.env.NEXT_PUBLIC_AUTH_USE_TEST_API
// if USE_TEST_CALLBACK is true, it will use the test callback URL
const BACKEND_CALLBACK_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${USE_TEST_CALLBACK ? 'test/' : ''}callback`;


export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const credential = searchParams.get('credential'); // Custom credential parameter
    const key = searchParams.get('key'); // Custom key parameter

    if (!credential) {
        return NextResponse.redirect(new URL('/login?error=missing_credential', request.url));
    }

    try {
        console.log('Sending to backend:', { key: key, credential: credential });

        // 1. Send the key and credential to your backend
        const backendResponse = await fetch(BACKEND_CALLBACK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ key, credential }),
        });

        console.log('Backend response status:', backendResponse.status, backendResponse.statusText);

        if (!backendResponse.ok) {
            let errorMessage = 'backend_auth_failed';
            try {
                const contentType = backendResponse.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await backendResponse.json();
                    errorMessage = errorData.message || errorMessage;
                } else {
                    // If response is not JSON, try to get text
                    const errorText = await backendResponse.text();
                    errorMessage = errorText || `HTTP ${backendResponse.status}`;
                }
            } catch (parseError) {
                console.error('Error parsing backend error response:', parseError);
                errorMessage = `HTTP ${backendResponse.status}: ${backendResponse.statusText}`;
            }
            console.error('Backend auth error:', errorMessage);
            return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url));
        }

        let responseData;
        try {
            // The backend returns a Bearer token string directly on success (200)
            // On error, it returns error details with appropriate status codes
            const responseText = await backendResponse.text();

            if (backendResponse.ok) {
                // Success: Backend returns Bearer token as plain text
                responseData = { token: responseText };
            } else {
                // Error: Try to parse as JSON, fallback to plain text
                try {
                    responseData = JSON.parse(responseText);
                } catch {
                    responseData = { error: responseText };
                }
            }
        } catch (parseError) {
            console.error('Error parsing backend response:', parseError);
            return NextResponse.redirect(new URL('/login?error=invalid_backend_response', request.url));
        }

        const { token } = responseData;

        if (!token) {
            return NextResponse.redirect(new URL('/login?error=no_token_from_backend', request.url));
        }

        // 2. Set the token in an HTTP-only cookie
        const cookieStore = await cookies();
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 24 hours (matches backend JWT expiry)
            path: '/',
            sameSite: 'lax',
        });

        // 3. Redirect to the desired page after login
        // You might get this from 'state' or have a default
        const redirectTo = searchParams.get('redirect_to') || '/instructor';
        return NextResponse.redirect(new URL(redirectTo, request.url));

    } catch (error) {
        console.error('Callback handler error:', error);
        return NextResponse.redirect(new URL('/login?error=callback_exception', request.url));
    }
}