import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "../../lib/constants";

// GET /logout : supprime le cookie de session puis renvoie vers /login.
// Utilisé aussi quand le backend répond 401 (token expiré).
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
