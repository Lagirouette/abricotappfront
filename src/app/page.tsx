import { redirect } from "next/navigation";

// "/" renvoie vers le tableau de bord (proxy.ts envoie vers /login si non connecté)
export default function Home() {
  redirect("/dashboard");
}
