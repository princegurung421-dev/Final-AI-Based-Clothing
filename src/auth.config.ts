import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      const isPublicPath =
        nextUrl.pathname === '/' ||
        nextUrl.pathname.startsWith('/browse') ||
        nextUrl.pathname.startsWith('/product') ||
        nextUrl.pathname === '/login' ||
        nextUrl.pathname === '/register';
      
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
