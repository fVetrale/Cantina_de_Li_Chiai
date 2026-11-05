"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { toggleWishlist, type WishlistActionError } from "@/lib/actions/wishlist";
import type { Dictionary } from "@/lib/i18n";
import { useCustomer } from "./CustomerProvider";

interface WishlistButtonProps {
  productId: string;
  productTitle: string;
  t: Dictionary["wishlist"];
  loginHref: string;
  /** "pdp": icon + text link; "card": round icon over the product image. */
  variant: "pdp" | "card";
}

/**
 * Heart toggle backed by the customer's Medusa metadata (ADR 042). The state comes from the
 * CustomerProvider; after a change the Server Action refreshes the page, which updates it.
 * Guests get an invitation to sign in instead of a fake "saved" state.
 */
export function WishlistButton({ productId, productTitle, t, loginHref, variant }: WishlistButtonProps) {
  const customer = useCustomer();
  const savedOnServer = !!customer?.wishlist.includes(productId);
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const [message, setMessage] = useState<WishlistActionError | "login" | null>(null);
  const [isPending, startTransition] = useTransition();
  const saved = isPending && optimistic !== null ? optimistic : savedOnServer;

  const onClick = () => {
    if (!customer) {
      setMessage(message === "login" ? null : "login");
      return;
    }
    setMessage(null);
    setOptimistic(!saved);
    startTransition(async () => {
      const result = await toggleWishlist({ productId });
      if (!result.ok) {
        setMessage(result.error === "unauthenticated" ? "login" : result.error);
      }
      setOptimistic(null);
    });
  };

  const messageText =
    message === "login"
      ? t.loginRequired
      : message === "limit_reached"
        ? t.limitReached
        : message
          ? t.error
          : null;

  const label = `${saved ? t.ariaRemove : t.ariaAdd}: ${productTitle}`;

  const messageBox = messageText && (
    <span
      role="status"
      className={`text-[11px] leading-snug text-cellar-700 ${
        variant === "card"
          ? "absolute right-0 top-11 z-20 w-48 rounded-xl border border-ivory-300 bg-white p-2.5 shadow-lg"
          : "block mt-1"
      }`}
    >
      {messageText}{" "}
      {message === "login" && (
        <Link href={loginHref} className="font-semibold text-wine-900 underline">
          {t.loginLink}
        </Link>
      )}
    </span>
  );

  if (variant === "card") {
    return (
      <span className="absolute top-3 right-3 z-10">
        <button
          type="button"
          onClick={onClick}
          aria-pressed={saved}
          aria-label={label}
          title={label}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 border border-ivory-300 shadow-sm hover:border-wine-300 transition-colors"
        >
          <Heart className={`w-4 h-4 transition-colors ${saved ? "fill-[#72182b] text-[#72182b]" : "text-cellar-500"}`} aria-hidden="true" />
        </button>
        {messageBox}
      </span>
    );
  }

  return (
    <span className="inline-block">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        aria-label={label}
        className="inline-flex items-center gap-2 hover:text-[#72182b] transition-colors group"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${saved ? "fill-[#72182b] text-[#72182b]" : "text-cellar-500 group-hover:text-[#72182b]"}`}
          aria-hidden="true"
        />
        <span className="underline">{saved ? t.saved : t.add}</span>
      </button>
      {messageBox}
    </span>
  );
}
