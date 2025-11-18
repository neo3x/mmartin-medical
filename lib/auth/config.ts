import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Credenciales inválidas');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            medicalProfile: true,
          },
        });

        if (!user || !user.password) {
          throw new Error('Usuario no encontrado');
        }

        if (!user.isActive) {
          throw new Error('Cuenta desactivada');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Contraseña incorrecta');
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        // Create audit log
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'user_login',
            entity: 'User',
            entityId: user.id,
            details: { method: 'credentials' },
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          technicalLevel: user.technicalLevel,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.technicalLevel = user.technicalLevel;
      }

      // Update token on session update
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.technicalLevel = token.technicalLevel as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
