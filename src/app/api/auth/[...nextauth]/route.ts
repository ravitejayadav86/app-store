import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

// Auto-detect production URL for Vercel deployments
const getBaseUrl = () => {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      return true;
    },
    async redirect({ url, baseUrl }) {
      const base = getBaseUrl();
      // Allow relative URLs
      if (url.startsWith("/")) return `${base}${url}`;
      // Allow same-origin
      if (url.startsWith(base)) return url;
      return base;
    },
    async session({ session, token }) {
      (session as any).login = token.login;
      (session as any).provider = token.provider;
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "github") {
        token.login = (profile as any)?.login;
      }
      if (account?.provider) {
        token.provider = account.provider;
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };