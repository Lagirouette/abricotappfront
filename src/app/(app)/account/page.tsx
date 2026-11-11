import type { Metadata } from "next";
import { Suspense } from "react";
import { displayName } from "@/src/lib/format";
import AccountForm from "@/src/components/account/AccountForm";
import { getCurrentUser } from "@/src/lib/user";
import { logout } from "@/src/app/actions/auth";

export const metadata: Metadata = { title: "Mon compte" };

export default function AccountPage() {
  return (
    <>
      <section className="border-line bg-surface rounded-[10px] border px-6 py-10 sm:px-14">
        <h1 className="font-heading text-lg font-semibold">Mon compte</h1>
        <Suspense fallback={<p className="text-muted mt-2">Chargement…</p>}>
          <AccountContent />
        </Suspense>
      </section>

      {/* Déconnexion par un formulaire POST (Server Action) : un simple lien GET
          pourrait être déclenché par un autre site (CSRF) ou par un préchargement. */}
      <form action={logout} className="mt-8 text-center">
        <button type="submit" className="text-primary text-sm underline">
          Se déconnecter
        </button>
      </form>
    </>
  );
}

async function AccountContent() {
  const user = await getCurrentUser();
  return (
    <>
      <p className="text-muted mt-1">{displayName(user)}</p>
      <AccountForm user={user} />
    </>
  );
}
