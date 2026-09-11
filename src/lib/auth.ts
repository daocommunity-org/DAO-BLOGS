import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";
import client from "./mongodb-client";

// Designated Admin User IDs & Emails
const ADMIN_USER_IDS = [
  "6aa41ebcf8e6a5333a46830d",
  ...(process.env.ADMIN_USER_IDS ? process.env.ADMIN_USER_IDS.split(",").map((s) => s.trim()) : []),
];

const ADMIN_EMAILS = [
  ...(process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map((s) => s.trim().toLowerCase()) : []),
];

const isAdminUser = (user: { id?: string; email?: string } | null | undefined) => {
  if (!user) return false;
  if (user.id && ADMIN_USER_IDS.includes(user.id)) return true;
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) return true;
  return false;
};

export const auth = betterAuth({
  database: mongodbAdapter(client.db(), {
    client,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user: any) => {
          if (isAdminUser(user)) {
            return { data: { ...user, role: "admin" } };
          }
        },
      },
    },
  },
  customSession: async ({ user, session }: { user: any; session: any }) => {
    if (isAdminUser(user)) {
      return {
        user: {
          ...user,
          role: "admin",
        },
        session,
      };
    }
    return { user, session };
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
});
