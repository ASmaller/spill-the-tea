"use server";

import { LoginButton } from "@/components/actions/LoginButton";
import { Wordmark } from "@/components/text/Wordmark";
import { getSession, isAdmin } from "@/lib/session";
import { FOCUS_RING } from "@/lib/styles";
import Link from "next/link";
import { ProfileButton } from "../actions/ProfileButton";

export async function PageHeader() {
  const session = await getSession();
  const admin = await isAdmin();

  return (
    <header className="border-ink/10 bg-paper supports-[backdrop-filter]:bg-paper/70 sticky top-0 z-30 box-border h-14 border-b pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-full items-center justify-between px-4">
        <Link
          href="/"
          aria-label="Spill the Tea — home"
          className={`rounded-sm ${FOCUS_RING.paper}`}
        >
          <Wordmark className="text-xl" />
        </Link>
        <span className="flex h-full flex-row items-center gap-4">
          <Link href="/suggest" className="text-ink font-serif">
            Suggest
          </Link>
          {session ? (
            <ProfileButton
              className="font-serif"
              profile={session}
              isAdmin={admin}
            />
          ) : (
            <LoginButton />
          )}
        </span>
      </div>
    </header>
  );
}
