"use client"; // Les error boundaries sont forcément des Client Components


import Logo from "../components/Logo";
import ErrorView from "../components/ui/ErrorView";

// Erreur hors des pages connectées (connexion, inscription…)
export default function RootError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center pt-20">
      <Logo className="text-brand w-[200px]" />
      <ErrorView error={error} retry={retry} />
    </main>
  );
}
