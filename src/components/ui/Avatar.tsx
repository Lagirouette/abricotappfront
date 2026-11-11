import { displayName, getInitials } from "@/src/lib/format";
import { User } from "@/src/types/api";

type Props = {
  user: Pick<User, "name" | "email">;
  tone?: "owner" | "default";
  className?: string;
};

export default function Avatar({ user, tone = "default", className = "" }: Props) {
  return (
    <span
      title={displayName(user)}
      className={`border-surface inline-flex size-[27px] shrink-0 items-center justify-center rounded-full border-2 text-[10px] ${
        tone === "owner" ? "bg-primary-light" : "bg-line"
      } ${className}`}
    >
      <span aria-hidden>{getInitials(user)}</span>
      <span className="sr-only">{displayName(user)}</span>
    </span>
  );
}
