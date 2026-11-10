import type { Task, TaskPriority, TaskStatus, User } from "../types/api";

/** "Alice Martin" -> "AM" ; sans nom, on prend les 2 premières lettres de l'email */
export function getInitials(user: Pick<User, "name" | "email">): string {
  const source = user.name?.trim();
  if (!source) return user.email.slice(0, 2).toUpperCase();
  const parts = source.split(/\s+/);
  const letters =
    parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

export function displayName(user: Pick<User, "name" | "email">): string {
  return user.name?.trim() || user.email;
}

/** "2024-03-09T00:00:00Z" -> "9 mars" (l'année est ajoutée si ce n'est pas l'année en cours) */
export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
    timeZone: "UTC",
  });
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminée",
  CANCELLED: "Annulée",
};

const PRIORITY_RANK: Record<TaskPriority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

/**
 * Les plus urgentes d'abord : priorité (URGENT -> LOW), puis échéance la plus proche.
 * Le backend trie la priorité par ordre alphabétique (HIGH, LOW, MEDIUM, URGENT),
 * on refait donc le tri ici.
 */
export function sortByUrgency(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const byPriority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (byPriority !== 0) return byPriority;
    const aDue = a.dueDate ? Date.parse(a.dueDate) : Infinity;
    const bDue = b.dueDate ? Date.parse(b.dueDate) : Infinity;
    return aDue - bDue;
  });
}
