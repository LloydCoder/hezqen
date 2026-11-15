"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { Route } from "next";

type NavigationItem = {
  href: Route;
  label: string;
};

export function MobileNavigation({ items }: { items: readonly NavigationItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    const closeWhenOutside = (target: EventTarget | null) => {
      if (target instanceof Node && !rootRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const handlePointerDown = (event: PointerEvent) => closeWhenOutside(event.target);
    const handleFocusIn = (event: FocusEvent) => closeWhenOutside(event.target);

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [open]);

  const previousPathname = useRef(pathname);
  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    setOpen(false);
  }, [pathname]);

  return (
    <div className="mobile-navigation" ref={rootRef}>
      <button
        className="mobile-menu-trigger"
        type="button"
        ref={triggerRef}
        aria-label={open ? "Close site navigation" : "Open site navigation"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="mobile-menu-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span>{open ? "Close" : "Menu"}</span>
      </button>
      <nav className="mobile-nav" id={panelId} aria-label="Mobile navigation" hidden={!open}>
        <ul className="mobile-nav-list">
          {items.map((item) => {
            const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span>{item.label}</span>
                  <span className="mobile-nav-arrow" aria-hidden="true">
                    ↗
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
