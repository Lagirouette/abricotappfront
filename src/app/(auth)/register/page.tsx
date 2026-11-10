import type { Metadata } from "next";
import AuthForm from "../../../components/auth/AuthForm";
import { register } from "../../actions/auth";

export const metadata: Metadata = { title: "Inscription" };

export default function RegisterPage() {
  return (
    <AuthForm
      title="Inscription"
      submitLabel="S'inscrire"
      action={register}
      footer={{
        text: "Déjà inscrit ?",
        linkLabel: "Se connecter",
        href: "/login",
      }}
    />
  );
}
