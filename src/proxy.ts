import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "./lib/constants";

// Pages accessibles sans être connecté
const PUBLIC_ROUTES = ["/login", "/register"];

/**
 * Vérification => on regarde seulement si le cookie existe.
 * La validité réelle du token est vérifiée par le backend à chaque appel
 * (une réponse 401 renvoie vers /logout).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (!hasSession && !isPublic && pathname !== "/logout") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Toutes les routes sauf les fichiers statiques et internes à Next
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.(?:png|jpg|jpeg|svg|webp)$).*)"],
};
