import type { Metadata } from "next";
import AuthForm from "../../../components/auth/AuthForm";
import { login } from "../../../app/actions/auth";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <AuthForm
      title="Connexion"
      submitLabel="Se connecter"
      action={login}
      showForgotPassword
      footer={{
        text: "Pas encore de compte ?",
        linkLabel: "Créer un compte",
        href: "/register",
      }}
    />
  );
}
