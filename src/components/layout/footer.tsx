import Link from "next/link";
import Image from "next/image";

const SOCIAL_LINKS = [
  {
    name: "GitHub",
    href: "https://github.com/daocommunity-org",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
      </svg>
    ),
  },
  {
    name: "X (Twitter)",
    href: "https://x.com/daocommunity_",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/dao-community-vitc-4792ab250/",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="15"
        height="15"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/daocommunity_/",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="15"
        height="15"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="mt-auto w-full dashed-border-t bg-background">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-2 dashed-border-x px-4 py-1 sm:px-10 sm:py-2">
        <div className="flex min-w-0 items-center gap-3 lg:gap-5">
          <Link
            href="/"
            className="inline-flex min-w-0 items-center gap-2 rounded-md text-xs font-semibold tracking-tight text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:text-sm"
          >
            <Image src="/daopng.png" alt="" width={28} height={28} className="size-6 shrink-0 sm:size-7" />
            <span className="truncate">DAO Community</span>
          </Link>
          <span className="sr-only text-xs whitespace-nowrap text-slate-400 lg:not-sr-only">
            © {new Date().getUTCFullYear()} DAO Community
          </span>
        </div>

        <nav aria-label="DAO Community social links" className="shrink-0">
          <ul className="flex items-center gap-0.5 sm:gap-1 lg:gap-3">
            {SOCIAL_LINKS.map(({ name, href, icon }) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 min-w-8 items-center justify-center gap-2 rounded-md px-1 text-sm font-medium whitespace-nowrap text-slate-300 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary motion-reduce:transition-none md:px-2"
                >
                  <span aria-hidden="true" className="grid size-4 shrink-0 place-items-center">
                    {icon}
                  </span>
                  <span className="sr-only md:not-sr-only">{name}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
