import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Dao Blogs",
  description: "Community blog platform",
  icons: {
    icon: "/daopng.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className={`${montserrat.className} min-h-full flex flex-col font-sans`}>
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#1b263b",
              border: "1px solid #415a77",
              color: "#ffffff",
              fontFamily: "var(--font-montserrat)",
            },
          }}
        />
      </body>
    </html>
  );
}
