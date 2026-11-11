"use client";

import "./globals.css";

export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  console.error(error);
  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col items-center justify-center px-4 text-center font-sans">
        <p aria-hidden className="text-brand text-7xl font-bold">
          Oups
        </p>
        <h1 className="mt-6 text-2xl font-semibold">L&apos;application a rencontré un problème</h1>
        <p className="text-muted mt-3 max-w-md">Rechargez la page. Si le problème persiste, réessayez plus tard.</p>
        <button
          type="button"
          onClick={() => retry()}
          className="bg-dark mt-10 h-[50px] rounded-[10px] px-6 text-sm text-white"
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
