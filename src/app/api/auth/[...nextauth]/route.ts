export const dynamic = "force-static";
export function generateStaticParams() {
  return [{ nextauth: ['placeholder'] }];
}
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
   
async signIn({ user }) {
  if (!user.email) return false;
  return true; // allow everyone
},
    
    async session({ session, token }) {
      (session as any).login = token.login;
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "github") {
        token.login = (profile as any)?.login;
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };