import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { verifyOTP } from "@/lib/otp";

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
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        await connectDB();
        const identifier = credentials.email as string;
        
        // Find user by email (case-insensitive) or username (case-insensitive)
        const user = await User.findOne({
          $or: [
            { email: identifier.toLowerCase() },
            { username: identifier }
          ]
        }).collation({ locale: 'en', strength: 2 });

        // OTP Login
        if (credentials.otp) {
          if (!user) return null;
          // OTP verification still uses email internally
          const isValid = await verifyOTP(user.email, credentials.otp as string);
          if (!isValid) return null;

          return {
            id: user._id.toString(),
            name: user.username,
            email: user.email,
            image: user.image,
          };
        }

        // Password Login
        if (credentials.password) {
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
        }

        return null;
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
          // Create new user from OAuth with retry for username race condition
          const baseName = (user.name || user.email.split("@")[0]!)
            .replace(/[^a-zA-Z0-9_]/g, "")
            .slice(0, 16);
          let username = baseName || "user";
          let suffix = 0;
          const maxRetries = 5;

          for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
              if (attempt > 0 || await User.findOne({ username })) {
                suffix++;
                username = `${baseName.slice(0, 12)}${suffix}`;
                // Re-check availability for first attempt's fallback
                if (attempt === 0) continue;
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
              break; // Success
            } catch (err: unknown) {
              const isDuplicateKey =
                err instanceof Error &&
                "code" in err &&
                (err as { code: number }).code === 11000;
              if (!isDuplicateKey || attempt === maxRetries - 1) {
                throw err;
              }
              // Duplicate key: retry with new suffix
              suffix++;
              username = `${baseName.slice(0, 12)}${suffix}`;
            }
          }
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
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