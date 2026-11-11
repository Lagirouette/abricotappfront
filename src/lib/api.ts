import { redirect } from "next/navigation";
import type { ApiResponse, ValidationError } from "../types/api";
import { getToken } from "./session";

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
  auth?: boolean;
};

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
    // Token expiré ou invalide
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
