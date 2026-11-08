"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/actions/auth";

/** Ends the session on this browser (ADR 040): removes the auth and cart cookies. */
export function LogoutButton({ label, homeHref }: { label: string; homeHref: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await logout();
          router.push(homeHref);
        })
      }
      className="link-editorial text-white/80 hover:text-gold-400 disabled:opacity-60"
    >
      {label}
    </button>
  );
}
