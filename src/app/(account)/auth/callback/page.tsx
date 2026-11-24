import { redirect } from "next/navigation";
import { getReturnPath } from "@/features/auth/return-path";

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const params = await searchParams;
  redirect(getReturnPath(params.returnTo));
}
