import { updateSession } from "@/utils/supabase/middleware";
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request) {
  // Update session and get user
  const response = await updateSession(request);
  const { user } = response;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding');

  // If user is logged in and tries to access any route outside /protected, redirect to /protected
  if (user && !isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // If user is not logged in and tries to access protected, redirect to /auth/login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Otherwise, continue as normal
  return response.supabaseResponse || response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
