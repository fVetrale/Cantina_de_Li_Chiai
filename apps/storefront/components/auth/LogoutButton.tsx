"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
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
      className="inline-flex items-center gap-2 rounded-full border-2 border-[#72182b] px-6 py-2.5 text-sm font-bold text-[#72182b] hover:bg-[#72182b]/5 disabled:opacity-60"
    >
      <LogOut className="w-4 h-4" aria-hidden="true" />
      {label}
    </button>
  );
}
