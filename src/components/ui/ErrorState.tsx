import Link from "next/link";

type Props = {
  code: string;
  title: string;
  message: string;
  action?: React.ReactNode;
  homeHref?: string;
  homeLabel?: string;
  details?: string;
};

export default function ErrorState({
  code,
  title,
  message,
  action,
  homeHref = "/dashboard",
  homeLabel = "Retour au tableau de bord",
  details,
}: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p aria-hidden className="font-heading text-brand text-7xl font-bold sm:text-8xl">
        {code}
      </p>
      <h1 className="font-heading mt-6 text-2xl font-semibold">{title}</h1>
      <p className="text-muted mt-3 max-w-md">{message}</p>
      {details && <p className="text-muted mt-2 text-xs">{details}</p>}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {action}
        <Link
          href={homeHref}
          className="border-line bg-surface hover:bg-background flex h-[50px] items-center rounded-[10px] border px-6 text-sm"
        >
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}
