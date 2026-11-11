import type { Metadata } from "next";
import { Suspense } from "react";
import { displayName } from "@/src/lib/format";
import AccountForm from "@/src/components/account/AccountForm";
import { getCurrentUser } from "@/src/lib/user";

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

      <p className="mt-8 text-center">
        <a href="/logout" className="text-primary text-sm underline">
          Se déconnecter
        </a>
      </p>
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
