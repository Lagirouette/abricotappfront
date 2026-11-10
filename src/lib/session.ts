import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./constants";

// Le backend ne renvoie pas la durée du token : on garde le cookie 7 jours,
// et toute réponse 401 du backend déconnecte l'utilisateur.
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function createSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(Date.now() + SESSION_DURATION_MS),
  });
}

export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
