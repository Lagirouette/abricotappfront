import Link from "next/link";
import { Suspense } from "react";
import NavLinks, { NavLinksView } from "./NavLinks";
import { getCurrentUser } from "../../lib/user";
import { displayName, getInitials } from "../../lib/format";
import Logo from "../Logo";
import AccountLink from "./AccountLink";

export default function Header() {
  return (
    <header className="bg-surface">
      <div className="mx-auto flex h-[92px] max-w-[1440px] items-center justify-between px-4 md:px-10 xl:px-[100px]">
        <Link href="/dashboard" aria-label="Accueil Abricot">
          <Logo className="text-brand w-[100px] sm:w-[147px]" />
        </Link>

        <Suspense fallback={<NavLinksView pathname={null} />}>
          <NavLinks />
        </Suspense>

        <Suspense fallback={<AvatarCircle initials="" />}>
          <UserAvatar />
        </Suspense>
      </div>
    </header>
  );
}

async function UserAvatar() {
  const user = await getCurrentUser();
  return <AccountLink initials={getInitials(user)} name={displayName(user)} />;
}

function AvatarCircle({ initials }: { initials: string }) {
  return (
    <span className="bg-primary-light flex size-12 items-center sm:size-[65px] justify-center rounded-full text-sm">
      {initials}
    </span>
  );
}
