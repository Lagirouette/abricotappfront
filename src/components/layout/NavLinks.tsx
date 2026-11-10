"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardIcon, FolderIcon } from "../../components/icons";

const LINKS = [
  { href: "/dashboard", label: "Tableau de bord", Icon: DashboardIcon },
  { href: "/projects", label: "Projets", Icon: FolderIcon },
];

export function NavLinksView({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Navigation principale" className="flex gap-2 sm:gap-4">
      {LINKS.map(({ href, label, Icon }) => {
        const active = pathname !== null && pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex h-[50px] items-center gap-3 rounded-[10px] px-4 text-sm transition sm:h-[78px] sm:w-[248px] sm:justify-center ${
              active ? "bg-dark text-white" : "text-primary hover:bg-primary-light"
            }`}
          >
            <Icon className={`size-5 ${active ? "text-white" : "text-primary"}`} />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function NavLinks() {
  return <NavLinksView pathname={usePathname()} />;
}
