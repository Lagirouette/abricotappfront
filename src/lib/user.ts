import { cache } from "react";
import { apiFetch } from "./api";
import type { User } from "../types/api";

/**
 * Utilisateur connecté. cache() évite de rappeler /auth/profile plusieurs fois
 * pendant un même rendu (header + message d'accueil par exemple).
 */
export const getCurrentUser = cache(async (): Promise<User> => {
  const { user } = await apiFetch<{ user: User }>("/auth/profile");
  return user;
});
