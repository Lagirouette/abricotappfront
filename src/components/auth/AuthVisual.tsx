"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

// Photo de droite des pages d'authentification, différente selon la page (maquettes)
const IMAGES = {
  "/login": "/images/auth-login.jpg",
  "/register": "/images/auth-register.jpg",
} as const;

/**
 * Visuel décoratif des pages Connexion / Inscription.
 * Le layout (auth) est commun aux deux pages : on choisit l'image d'après l'URL.
 * - alt="" : image purement décorative, ignorée par les lecteurs d'écran.
 * - Masquée sous 1024px (lg) : sur mobile, seul le formulaire est affiché, et l'image
 *   (chargement différé par défaut) n'est alors pas téléchargée.
 */
export default function AuthVisual() {
  const pathname = usePathname();
  const src = pathname === "/register" ? IMAGES["/register"] : IMAGES["/login"];

  return (
    <div className="bg-line relative hidden flex-1 lg:block">
      <Image src={src} alt="" fill sizes="61vw" className="object-cover" />
    </div>
  );
}
