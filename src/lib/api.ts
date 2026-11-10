import { redirect } from "next/navigation";
import type { ApiResponse, ValidationError } from "../types/api";
import { getToken } from "./session";

// URL du backend. Les appels partent du serveur Next, donc pas de souci de CORS.
const API_URL = process.env.API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors: ValidationError[] = []
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** false pour les routes publiques (login, register) */
  auth?: boolean;
};

/**
 * Appelle le backend et renvoie `data` de la réponse.
 * - Ajoute le header Authorization à partir du cookie de session.
 * - Lève une ApiError si la réponse n'est pas un succès.
 * - Redirige vers /login si le token est invalide ou expiré (401).
 */
export async function apiFetch<T>(
  path: string,
  { method = "GET", body, auth = true }: FetchOptions = {}
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (auth) {
    const token = await getToken();
    if (!token) redirect("/login");
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "Impossible de joindre le serveur. Vérifiez que le backend est démarré.",
      0
    );
  }

  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (res.status === 401 && auth) {
    // Token expiré ou invalide : on passe par la route de déconnexion
    redirect("/logout");
  }

  if (!res.ok || !json?.success) {
    const errors =
      (json?.data as { errors?: ValidationError[] } | undefined)?.errors ?? [];
    throw new ApiError(
      json?.message ?? "Une erreur est survenue",
      res.status,
      errors
    );
  }

  return json.data as T;
}
