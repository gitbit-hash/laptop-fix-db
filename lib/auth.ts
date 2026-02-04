import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";

// Extend the PrismaAdapter to handle the custom 'role' field
const customAdapter = {
  ...PrismaAdapter(prisma),
  async createUser(user: AdapterUser) {
    const prismaUser = await prisma.user.create({
      data: {
        ...user,
        role: "USER", // Set default role for new users
      },
    });
    // Return the fields including the custom role field
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      emailVerified: prismaUser.emailVerified,
      name: prismaUser.name,
      image: prismaUser.image,
      role: prismaUser.role,
    };
  },
} as unknown as Adapter;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: customAdapter,
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],
});
