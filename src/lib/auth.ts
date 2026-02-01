import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();
        const user = await User.findOne({
          email: (credentials.email as string).toLowerCase(),
        });
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: user.username,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;

      // OAuth flow: link or create user
      if (account && user.email) {
        await connectDB();
        const existing = await User.findOne({ email: user.email.toLowerCase() });

        if (existing) {
          // Link provider if not already linked
          const alreadyLinked = existing.accounts.some(
            (a) =>
              a.provider === account.provider &&
              a.providerAccountId === account.providerAccountId
          );
          if (!alreadyLinked) {
            existing.accounts.push({
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            });
            if (!existing.image && user.image) {
              existing.image = user.image;
            }
            await existing.save();
          }
        } else {
          // Create new user from OAuth
          const baseName = (user.name || user.email.split("@")[0]!)
            .replace(/[^a-zA-Z0-9_]/g, "")
            .slice(0, 16);
          let username = baseName || "user";
          // Ensure unique username
          let suffix = 0;
          while (await User.findOne({ username })) {
            suffix++;
            username = `${baseName.slice(0, 12)}${suffix}`;
          }

          await User.create({
            username,
            email: user.email.toLowerCase(),
            image: user.image || null,
            accounts: [
              {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            ],
          });
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // Initial sign-in
        if (user.id) {
          token.userId = user.id;
        } else if (user.email) {
          await connectDB();
          const dbUser = await User.findOne({ email: user.email.toLowerCase() });
          if (dbUser) {
            token.userId = dbUser._id.toString();
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
});
