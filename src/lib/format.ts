import type { Project, Task, TaskPriority, TaskStatus, User } from "../types/api";

export function getInitials(user: Pick<User, "name" | "email">): string {
  const source = user.name?.trim();
  if (!source) return user.email.slice(0, 2).toUpperCase();
  const parts = source.split(/\s+/);
  const letters =
    parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

export function splitName(name: string | null): { firstName: string; lastName: string } {
  const [firstName = "", ...rest] = (name ?? "").trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

export function displayName(user: Pick<User, "name" | "email">): string {
  return user.name?.trim() || user.email;
}

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

/** Tâche encore à traiter (ni terminée ni annulée) */
export function isPending(task: Task): boolean {
  return task.status === "TODO" || task.status === "IN_PROGRESS";
}

/** Échéance dépassée pour une tâche non terminée (comparaison au jour près, en UTC) */
export function isOverdue(task: Task): boolean {
  if (!task.dueDate || !isPending(task)) return false;
  const today = new Date().toISOString().slice(0, 10);
  return task.dueDate.slice(0, 10) < today;
}

/** Échéance la plus proche parmi les tâches à traiter d'un projet (null s'il n'y en a pas) */
export function nextDueDate(tasks: Task[]): string | null {
  const dates = tasks
    .filter((t) => isPending(t) && t.dueDate)
    .map((t) => t.dueDate!)
    .sort();
  return dates[0] ?? null;
}

/**
 * Projets les plus urgents d'abord : prochaine échéance des tâches à traiter,
 * puis nombre de tâches à traiter. Les projets sans tâche en attente passent à la fin.
 */
export function sortProjectsByUrgency(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const aDue = nextDueDate(a.tasks ?? []);
    const bDue = nextDueDate(b.tasks ?? []);
    if (aDue !== bDue) {
      if (!aDue) return 1;
      if (!bDue) return -1;
      return aDue < bDue ? -1 : 1;
    }
    const aPending = (a.tasks ?? []).filter(isPending).length;
    const bPending = (b.tasks ?? []).filter(isPending).length;
    return bPending - aPending;
  });
}
