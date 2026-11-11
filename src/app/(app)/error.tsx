"use client";

import ErrorView from "@/src/components/ui/ErrorView";

export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorView error={error} retry={retry} />;
}
