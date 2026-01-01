import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

// Extend session type to include role
declare module "next-auth" {
    interface Session {
        user: {
            id: string
            name?: string | null
            email?: string | null
            image?: string | null
            role: string
        }
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
                // Fetch role from DB as it might be updated
                const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
                session.user.role = dbUser?.role ?? "USER";
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin', // Custom signin page if needed, or default
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
