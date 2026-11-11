import type { Metadata } from "next";
import Logo from "../components/Logo";
import ErrorState from "../components/ui/ErrorState";

export const metadata: Metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center pt-20">
      <Logo className="text-primary w-[200px]" />
      <ErrorState
        code="404"
        title="Page introuvable"
        message="L'adresse demandée n'existe pas. Vérifiez le lien ou revenez à l'accueil."
      />
    </main>
  );
}
