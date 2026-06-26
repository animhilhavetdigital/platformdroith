import { NextRequest, NextResponse } from 'next/server';
import { isDevAccessEnabled } from './lib/dev-access';
import { createMiddlewareSupabaseClient } from './lib/supabase';
import { UserRole } from './types';

// Routes protégées par rôle
const ROLE_ROUTES: Record<string, UserRole[]> = {
  '/dashboard/super-admin': ['super_admin'],
  '/dashboard/admin': ['super_admin'],
  '/dashboard/negotiator': ['super_admin', 'negotiator'],
  '/dashboard/client': ['super_admin', 'client', 'negotiator'],
};

// Routes publiques
const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register', '/api/webhook'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Autoriser les routes publiques
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith('/api/'))) {
    return NextResponse.next();
  }

  // Bypass local pour la visualisation des dashboards
  if (isDevAccessEnabled()) {
    return NextResponse.next();
  }

  const { supabase, response } = createMiddlewareSupabaseClient(request);

  // Vérifier la session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Récupérer le rôle de l'utilisateur
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const userRole = profile?.role as UserRole;

  // Vérifier les permissions de route
  for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(routePrefix)) {
      if (!allowedRoles.includes(userRole)) {
        // Rediriger vers le dashboard approprié
        const redirectPath = getDefaultDashboard(userRole);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }
  }

  return response;
}

function getDefaultDashboard(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return '/dashboard/admin';
    case 'negotiator':
      return '/dashboard/negotiator';
    case 'client':
      return '/dashboard/client';
    default:
      return '/auth/login';
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
