import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token_bdu')?.value;
    const { pathname } = request.nextUrl;

    const isAuthPage =
        pathname.startsWith('/login') ||
        pathname.startsWith('/forgot-password') ||
        pathname.startsWith('/reset-password') ||
        pathname.startsWith('/change-password');

    // Accueil : redirection selon l'état d'authentification
    if (pathname === '/') {
        return token
            ? NextResponse.redirect(new URL('/dashboard', request.url))
            : NextResponse.redirect(new URL('/login', request.url));
    }

    // Protection des routes dashboard
    if (!isAuthPage && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Si déjà connecté et on va sur une page auth (sauf change-password)
    if (token && (pathname.startsWith('/login') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password'))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
    ],
};
