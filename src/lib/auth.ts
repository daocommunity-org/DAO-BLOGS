import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";
import client from "./mongodb-client";
import { ADMIN_USER_IDS } from "@/config/admins";

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
  disabledPaths: [
    "/admin/set-role", "/admin/create-user", "/admin/update-user",
    "/admin/set-user-password", "/admin/remove-user", "/admin/impersonate-user",
    "/admin/stop-impersonating", "/admin/ban-user", "/admin/unban-user",
    "/admin/get-user", "/admin/list-users", "/admin/list-user-sessions",
    "/admin/revoke-user-session", "/admin/revoke-user-sessions",
    "/admin/has-permission",
  ],
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
      adminUserIds: ADMIN_USER_IDS,
    }),
  ],
});
