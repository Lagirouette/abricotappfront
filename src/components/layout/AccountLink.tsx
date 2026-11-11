"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AccountLink({ initials, name }: { initials: string; name: string }) {
  const active = usePathname() === "/account";
  return (
    <Link
      href="/account"
      aria-label={`Mon compte (${name})`}
      aria-current={active ? "page" : undefined}
      className={`flex size-12 items-center justify-center rounded-full text-sm transition sm:size-[65px] ${
        active ? "bg-primary text-white" : "bg-primary-light hover:bg-primary hover:text-white"
      }`}
    >
      {initials}
    </Link>
  );
}
