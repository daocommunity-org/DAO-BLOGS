import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import styles from "./not-found-face.module.css";

function NotFoundFace() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 320 380" className="w-28 text-primary sm:w-36">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={25}>
        <g className={styles.eyes} transform="translate(0,15)">
          <g transform="translate(15,0)">
            <polyline className={styles.lid} points="37,0 0,120 75,120" />
            <polyline className={styles.pupil} points="55,120 55,155" strokeDasharray="35 35" />
          </g>
          <g transform="translate(230,0)">
            <polyline className={styles.lid} points="37,0 0,120 75,120" />
            <polyline className={styles.pupil} points="55,120 55,155" strokeDasharray="35 35" />
          </g>
        </g>
        <rect className={styles.nose} x="132.5" y="112.5" width={55} height={155} rx={4} ry={4} />
        <g transform="translate(65,334)" strokeDasharray="102 102">
          <path className={styles.mouthLeft} d="M 0 30 C 0 30 40 0 95 0" />
          <path className={styles.mouthRight} d="M 95 0 C 150 0 190 30 190 30" />
        </g>
      </g>
    </svg>
  );
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex flex-1">
        <section className="mx-auto flex w-full max-w-screen-2xl flex-col items-center justify-center px-6 py-12 text-center dashed-border-x sm:py-16">
          <NotFoundFace />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            <span className="text-primary">404</span> · Page not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">This page may have moved or is unavailable.</p>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to blogs
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
