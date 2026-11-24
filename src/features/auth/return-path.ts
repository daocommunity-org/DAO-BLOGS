export function getReturnPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || /[\\\u0000-\u0020]/.test(value)) return "/";

  const origin = "https://app.invalid";
  const url = new URL(value, origin);
  if (url.origin !== origin || url.pathname.startsWith("//") || url.pathname.startsWith("/api/") ||
      url.pathname.startsWith("/sign-in/") || url.pathname.startsWith("/auth/callback")) return "/";

  return url.pathname + url.search + url.hash;
}
