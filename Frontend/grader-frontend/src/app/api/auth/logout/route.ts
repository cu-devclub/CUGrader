import { NextResponse } from 'next/server';

export async function POST() {
    try {
        console.log('Logging out user...');

        // Create a response to clear the cookies
        const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });
        response.cookies.delete('auth_token');
        response.cookies.delete('user_info');

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ message: 'An error occurred during logout.' }, { status: 500 });
    }
}
