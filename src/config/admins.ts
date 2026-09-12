/**
 * Designated Admin User IDs
 * Add user IDs here or configure via the ADMIN_USER_IDS environment variable.
 */
export const ADMIN_USER_IDS: string[] = [
  "6aa41ebcf8e6a5333a46830d", // Vishal P
  "6aa518cfe0b081a8f0f759a6", // FRANK
  "6aa436d32df875cca8324cd8", // Supbase test
  ...(process.env.ADMIN_USER_IDS
    ? process.env.ADMIN_USER_IDS.split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : []),
];
