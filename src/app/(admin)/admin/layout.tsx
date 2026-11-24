import { requireAdminPage } from "@/features/auth/admin-access";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {children}
    </div>
  );
}
