import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { verifyOTP } from "@/lib/otp";

const ADJECTIVES = [
  "swift", "silent", "rapid", "cosmic", "lunar", "stellar", "neon", "cyber",
  "turbo", "hyper", "ultra", "mega", "pixel", "glitch", "blur", "flash",
  "crisp", "sharp", "slick", "bold", "fierce", "zen", "frost", "ember",
];

const NOUNS = [
  "typer", "keys", "fox", "wolf", "hawk", "lynx", "puma", "raven",
  "spark", "bolt", "dash", "byte", "bit", "code", "node", "pulse",
  "ghost", "shade", "storm", "blaze", "flare", "drift", "echo", "void",
];

function generateRandomUsername(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]!;
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]!;
  const num = Math.floor(Math.random() * 999);
  return `${adj}_${noun}${num}`;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   // Refresh token every 24 hours
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
          // Create new user with a random valid username
          const maxRetries = 5;
          for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
              await User.create({
                username: generateRandomUsername(),
                email: user.email.toLowerCase(),
                image: user.image || null,
                accounts: [
                  {
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                  },
                ],
              });
              break;
            } catch (err: unknown) {
              const isDuplicateKey =
                err instanceof Error &&
                "code" in err &&
                (err as { code: number }).code === 11000;
              if (!isDuplicateKey || attempt === maxRetries - 1) {
                throw err;
              }
            }
          }
        }
      }

      return true;
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        await connectDB();

        if (account?.provider === "credentials") {
          token.userId = user.id;
          const dbUser = await User.findById(user.id).select("username");
          token.name = dbUser?.username ?? user.name;
        } else if (user.email) {
          const dbUser = await User.findOne(
            { email: user.email.toLowerCase() },
            { _id: 1, username: 1 }
          );
          if (dbUser) {
            token.userId = dbUser._id.toString();
            token.name = dbUser.username;
          }
        }
      }

      // Refresh username from DB when session is updated (e.g. after username change)
      if (trigger === "update" && token.userId) {
        await connectDB();
        const dbUser = await User.findById(token.userId).select("username");
        token.name = dbUser?.username ?? token.name;
      }

      // Self-healing: if userId is missing but we have an email, resolve from DB.
      // Handles stale JWT cookies from previous auth flow changes.
      if (!token.userId && token.email) {
        await connectDB();
        const dbUser = await User.findOne(
          { email: (token.email as string).toLowerCase() },
          { _id: 1, username: 1 }
        );
        if (dbUser) {
          token.userId = dbUser._id.toString();
          token.name = dbUser.username;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId;
      }
      session.user.name = token.name as string | undefined;
      return session;
    },
  },
});
