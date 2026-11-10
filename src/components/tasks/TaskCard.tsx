import Link from "next/link";
import type { Task } from "../../types/api";
import { formatShortDate } from "../../lib/format";
import { CalendarIcon, CommentIcon, FolderIcon } from "../../components/icons";
import StatusBadge from "./StatusBadge";

type Props = {
  task: Task;
  /** "list" : bouton Voir à droite ; "kanban" : carte étroite, bouton en bas */
  variant?: "list" | "kanban";
};

export default function TaskCard({ task, variant = "list" }: Props) {
  const isList = variant === "list";

  return (
    <article
      className={`border-line bg-surface rounded-[10px] border px-5 py-6 ${
        isList
          ? "flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:px-10"
          : "flex flex-col gap-6"
      }`}
    >
      <div className="flex min-w-0 flex-col gap-4">
        <div className={isList ? "" : "flex items-start justify-between gap-2"}>
          <div className="min-w-0">
            <h3 className={`font-heading text-lg font-semibold ${isList ? "truncate" : "line-clamp-2"}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-muted mt-1 line-clamp-2 text-sm">{task.description}</p>
            )}
          </div>
          {!isList && <StatusBadge status={task.status} />}
        </div>

        <ul className="text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {task.project && (
            <li className="flex items-center gap-2">
              <FolderIcon className="size-4" />
              <span className="sr-only">Projet :</span>
              {task.project.name}
            </li>
          )}
          {task.dueDate && (
            <li className="border-line flex items-center gap-2 border-l pl-3">
              <CalendarIcon />
              <span className="sr-only">Échéance :</span>
              <time dateTime={task.dueDate}>{formatShortDate(task.dueDate)}</time>
            </li>
          )}
          <li className="border-line flex items-center gap-2 border-l pl-3">
            <CommentIcon />
            <span className="sr-only">Commentaires :</span>
            {task.comments.length}
          </li>
        </ul>
      </div>

      <div
        className={
          isList
            ? "flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-8"
            : ""
        }
      >
        {isList && <StatusBadge status={task.status} />}
        <Link
          href={`/projects/${task.projectId}`}
          className="bg-dark inline-flex h-[50px] w-[121px] items-center justify-center rounded-[10px] text-sm text-white transition hover:opacity-90"
        >
          Voir<span className="sr-only"> la tâche {task.title}</span>
        </Link>
      </div>
    </article>
  );
}
