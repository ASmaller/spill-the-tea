import { Wordmark } from "@/components/brand/Wordmark";
import { LoginButton } from "@/components/LoginButton";
import { FOCUS_RING } from "@/lib/styles";
import Link from "next/link";

export function FeedHeader() {
  return (
    <header className="border-ink/10 bg-paper supports-[backdrop-filter]:bg-paper/70 sticky top-0 z-30 border-b pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-sm items-center justify-between px-4">
        <Link
          href="/"
          aria-label="Spill the Tea — home"
          className={`rounded-sm ${FOCUS_RING.paper}`}
        >
          <Wordmark size={20} />
        </Link>
        <span className="flex flex-row gap-4">
          <Link href="/suggest" className="text-ink font-serif">
            Suggest
          </Link>
          <LoginButton />
        </span>
      </div>
    </header>
  );
}
