import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Configuration
const USE_TEST_CALLBACK = process.env.NEXT_PUBLIC_AUTH_USE_TEST_API === 'true';
const BACKEND_CALLBACK_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${USE_TEST_CALLBACK ? 'test/' : ''}callback`;

// Types
interface BackendResponse {
    token?: string;
    error?: string;
}

interface JWTClaims {
    role: 'student' | 'teacher';
    exp: number;
    email: string;
    user_id: number;
}

// Helper functions
async function callBackendAPI(key: string | null, credential: string): Promise<Response> {
    console.log('Calling backend:', BACKEND_CALLBACK_URL);

    return fetch(BACKEND_CALLBACK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, credential }),
    });
}

async function parseBackendResponse(response: Response): Promise<BackendResponse> {
    const responseText = await response.text();

    if (response.ok) {
        // Success: Backend returns Bearer token as plain text
        return { token: responseText };
    }

    // Error: Try to parse as JSON, fallback to plain text
    try {
        return JSON.parse(responseText);
    } catch {
        return { error: responseText || `HTTP ${response.status}: ${response.statusText}` };
    }
}

function decodeJWTClaims(token: string): JWTClaims | null {
    try {
        const cleanToken = token.replace(/^Bearer\s+/, '');
        const parts = cleanToken.split('.');

        if (parts.length !== 3) return null;

        const payload = parts[1];
        const decodedPayload = Buffer.from(payload, 'base64url').toString('utf-8');
        return JSON.parse(decodedPayload);
    } catch {
        return null;
    }
}

function getUserRedirectUrl(claims: JWTClaims | null): string {
    if (!claims) return '/instructor'; // default fallback

    return claims.role === 'student' ? '/student' : '/instructor';
}

async function setAuthCookie(token: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
        sameSite: 'lax',
    });
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const credential = searchParams.get('credential');
    const key = searchParams.get('key');

    const createErrorResponse = (error: string, status: number = 400) => {
        const encodedError = encodeURIComponent(error);
        return NextResponse.json({ success: false, redirectTo: `/login?error=${encodedError}` }, { status });
    };

    // Validate required parameters
    if (!credential) {
        return createErrorResponse('Missing credential parameter');
    }

    try {
        // Call backend API
        const backendResponse = await callBackendAPI(key, credential);

        // Handle backend errors
        if (!backendResponse.ok) {
            const errorData = await parseBackendResponse(backendResponse);
            const errorMessage = errorData.error || 'Backend authentication failed';
            console.error('Backend auth error:', errorMessage);
            return createErrorResponse(errorMessage);
        }

        // Parse successful response
        const responseData = await parseBackendResponse(backendResponse);

        if (!responseData.token) {
            return createErrorResponse('No token received from backend');
        }

        // Set authentication cookie
        await setAuthCookie(responseData.token);

        // Determine redirect URL based on user role
        const claims = decodeJWTClaims(responseData.token);
        const defaultRedirect = getUserRedirectUrl(claims);
        const finalRedirect = searchParams.get('redirect_to') || defaultRedirect;

        console.log('Authentication successful, redirecting to:', finalRedirect);
        return NextResponse.json({ success: true, redirectTo: finalRedirect });

    } catch (error) {
        console.error('Callback handler error:', error);
        return createErrorResponse('Authentication service temporarily unavailable', 500);
    }
}