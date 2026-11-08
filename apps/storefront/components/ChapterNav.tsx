"use client";

import { useEffect, useState } from "react";

export interface Chapter {
  id: string;
  label: string;
}

/**
 * Tab bar to jump between the full-screen chapters of a narrative page (ADR 045).
 * Plain anchor links (keyboard and no-JS friendly); the active tab follows the scroll.
 */
export function ChapterNav({
  chapters,
  label,
  className = "",
}: {
  chapters: Chapter[];
  label: string;
  className?: string;
}) {
  const [active, setActive] = useState(chapters[0]?.id ?? "");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    for (const chapter of chapters) {
      const el = document.getElementById(chapter.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [chapters]);

  return (
    <nav aria-label={label} className={`bg-white border-ivory-300 ${className}`}>
      <ul className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 flex items-center justify-start lg:justify-center gap-6 lg:gap-10 overflow-x-auto no-scrollbar">
        {chapters.map((chapter) => {
          const isActive = chapter.id === active;
          return (
            <li key={chapter.id} className="shrink-0">
              <a
                href={`#${chapter.id}`}
                aria-current={isActive ? "true" : undefined}
                className={`relative block py-4 font-sans text-[11px] font-bold uppercase tracking-[3px] whitespace-nowrap transition-colors duration-200 ${
                  isActive
                    ? "text-black after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-black"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                {chapter.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
