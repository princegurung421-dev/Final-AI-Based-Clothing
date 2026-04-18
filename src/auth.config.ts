import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  // JWT + 30-day sessions, refreshed on every request via updateAge=0.
  // In practice this means: sign in once, stay signed in for 30 days of
  // inactivity; any activity extends the session another 30 days.
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,   // refresh at most once / day
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      const isPublicPath =
        nextUrl.pathname === '/' ||
        nextUrl.pathname.startsWith('/browse') ||
        nextUrl.pathname.startsWith('/product') ||
        nextUrl.pathname === '/login' ||
        nextUrl.pathname === '/register' ||
        nextUrl.pathname === '/faq' ||
        nextUrl.pathname === '/contact' ||
        nextUrl.pathname === '/privacy' ||
        nextUrl.pathname === '/terms';
      
      const isAdminPath = nextUrl.pathname.startsWith('/admin');

      if (!isPublicPath && !isLoggedIn) {
        return false;
      }

      if (isAdminPath && auth?.user?.role !== 'ADMIN') {
        return Response.redirect(new URL('/', nextUrl));
      }

      if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')) {
        return Response.redirect(new URL('/', nextUrl));
      }

      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    }
  },
  providers: [], // configured in auth.ts
} satisfies NextAuthConfig;
