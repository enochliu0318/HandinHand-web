import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/generated/prisma/client";

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const pathname = nextUrl.pathname;
      const role = auth?.user?.role;
      const isLoggedIn = !!auth?.user;

      if (pathname.startsWith("/admin")) {
        return isLoggedIn && role === "ADMIN";
      }
      if (pathname.startsWith("/dashboard")) {
        return isLoggedIn && role === "TEACHER";
      }
      if (pathname.startsWith("/parent")) {
        return isLoggedIn && role === "PARENT";
      }
      return true;
    },
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
