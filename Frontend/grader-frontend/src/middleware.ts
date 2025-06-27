import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Define protected routes and their allowed roles
const PROTECTED_ROUTES = {
    '/instructor': ['student', 'teacher'], // Student (TA) can access instructor routes
    '/student': ['student', 'teacher'], // Teachers can also access student routes
    '/admin': ['admin']
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
    '/login',
    '/callback',
    '/api/auth/callback',
    '/example',
];

// Function to decode JWT and extract user info
function decodeJWT(token: string) {
    try {
        // Remove "Bearer " prefix if present
        const cleanToken = token.replace(/^Bearer\s+/, '');

        // Split the JWT into parts
        const parts = cleanToken.split('.');
        if (parts.length !== 3) {
            return null;
        }

        // Decode the payload (second part)
        const payload = parts[1];
        const decodedPayload = Buffer.from(payload, 'base64url').toString('utf-8');
        const claims = JSON.parse(decodedPayload);

        // Check if token is expired
        if (claims.exp && Date.now() >= claims.exp * 1000) {
            return null;
        }

        return {
            userId: claims.user_id,
            email: claims.email,
            role: claims.role,
            firstname: claims.firstname,
            lastname: claims.lastname,
            profile: claims.profile,
            exp: claims.exp
        };
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

// Function to check if a route is public
function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some(route => {
        if (route === '/_next' || route === '/api') {
            return pathname.startsWith(route);
        }
        return pathname === route || pathname.startsWith(route + '/');
    });
}

// Function to check if user has access to a route
function hasRouteAccess(pathname: string, userRole: string): boolean {
    // Check if the route requires specific roles
    for (const [route, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
        if (pathname === route || pathname.startsWith(route + '/')) {
            return allowedRoles.includes(userRole);
        }
    }

    // If route is not in protected routes, allow access for authenticated users
    return true;
}

export async function middleware(request: NextRequest) {
    if (process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true") {
        return NextResponse.next();
    }
    
    const { pathname } = request.nextUrl;
    console.log('🚀 MIDDLEWARE running for:', pathname);

    const authToken = request.cookies.get('auth_token')?.value;
    const user = authToken ? decodeJWT(authToken) : null;

    // 1. Redirect authenticated users away from login page
    if (user && pathname === '/login') {
        const redirectUrl = user.role === 'student' ? '/student' : '/instructor';
        console.log(`↩️ Authenticated user on /login, redirecting to ${redirectUrl}`);
        return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // 2. Allow access to public routes
    if (isPublicRoute(pathname)) {
        console.log('✅ Allowing access to public route:', pathname);
        return NextResponse.next();
    }

    // 3. If no token and not a public route, redirect to login
    if (!user) {
        console.log('❌ No auth token, redirecting to login from:', pathname);
        const loginUrl = new URL('/login', request.url);
        if (pathname !== '/') {
            loginUrl.searchParams.set('redirect', pathname);
        }
        return NextResponse.redirect(loginUrl);
    }

    // 4. User is authenticated, check role-based access
    console.log('👤 User authenticated:', user.email, 'role:', user.role, 'accessing:', pathname);
    if (!hasRouteAccess(pathname, user.role)) {
        const redirectUrl = user.role === 'student' ? '/student' : '/instructor';
        console.log('🔄 User lacks access to', pathname, 'redirecting to:', redirectUrl);
        return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // 5. Access granted
    console.log('✅ User has access, proceeding to:', pathname);
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.userId.toString());
    response.headers.set('x-user-email', user.email);
    response.headers.set('x-user-role', user.role);
    response.headers.set('x-user-name', `${user.firstname} ${user.lastname}`);
    return response;
}

// Configure which routes the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files with extensions
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
    ],
};