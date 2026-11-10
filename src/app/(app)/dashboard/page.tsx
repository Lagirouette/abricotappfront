import type { Metadata } from "next";
import { Suspense } from "react";
import { apiFetch } from "../../../lib/api";
import type { User } from "../../../types/api";

export const metadata: Metadata = { title: "Tableau de bord" };

// Page provisoire
export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-5xl p-10">
      <h1 className="font-heading text-2xl font-semibold">Tableau de bord</h1>
      <Suspense fallback={<p className="text-muted mt-2">Chargement…</p>}>
        <Greeting />
      </Suspense>
      <a href="/logout" className="text-primary mt-6 inline-block underline">
        Se déconnecter
      </a>
    </main>
  );
}

async function Greeting() {
  const { user } = await apiFetch<{ user: User }>("/auth/profile");
  return <p className="mt-2">Bonjour {user.name ?? user.email}</p>;
}
