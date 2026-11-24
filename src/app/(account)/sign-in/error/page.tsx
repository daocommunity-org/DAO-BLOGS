import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getReturnPath } from "@/features/auth/return-path";
import { SignInPrompt } from "@/features/auth/sign-in-dialog";

export default async function SignInErrorPage({ searchParams }: PageProps<"/sign-in/error">) {
  const { returnTo } = await searchParams;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <SignInPrompt
          returnTo={getReturnPath(typeof returnTo === "string" ? returnTo : undefined)}
          message="Google sign-in was cancelled or couldn’t be completed. You can try again."
        />
      </main>
      <Footer />
    </>
  );
}
