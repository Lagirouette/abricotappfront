"use client";

import { useMemo, useState } from "react";
import type { Project, Task, TaskStatus } from "../../types/api";
import { formatShortDate, isOverdue, isPending, nextDueDate, STATUS_LABELS } from "../../lib/format";
import { CalendarIcon, FolderIcon, ListIcon, SearchIcon } from "../../components/icons";
import TaskCard from "../../components/tasks/TaskCard";
import StatusBadge from "../tasks/StatusBadge";
import Link from "next/link";

type View = "list" | "kanban" | "projects";

type Props = {
  tasks: Task[];
  projects: Project[];
};

export default function DashboardViews({ tasks, projects }: Props) {
  const [view, setView] = useState<View>("list");

  return (
    <>
      <div role="group" aria-label="Affichage des tâches" className="mt-14 mb-10 flex gap-2">
        <ViewTab active={view === "list"} onClick={() => setView("list")}>
          <ListIcon /> Liste
        </ViewTab>
        <ViewTab active={view === "kanban"} onClick={() => setView("kanban")}>
          <CalendarIcon /> Kanban
        </ViewTab>
        <ViewTab active={view === "projects"} onClick={() => setView("projects")}>
          <FolderIcon className="size-4" /> Projets
        </ViewTab>
      </div>

      {view === "list" && <ListView tasks={tasks} />}
      {view === "kanban" && <KanbanView tasks={tasks} />}
      {view === "projects" && <ProjectsView projects={projects} />}
    </>
  );
}

function ViewTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`text-primary flex h-[45px] items-center gap-2 rounded-[4px] px-4 text-sm transition ${
        active ? "bg-primary-light" : "bg-surface hover:bg-primary-light/60"
      }`}
    >
      {children}
    </button>
  );
}

function ListView({ tasks }: { tasks: Task[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t) =>
      [t.title, t.description ?? "", t.project?.name ?? ""].some((field) =>
        field.toLowerCase().includes(q)
      )
    );
  }, [tasks, query]);

  return (
    <section
      aria-labelledby="assigned-title"
      className="border-line bg-surface rounded-[10px] border px-4 py-10 sm:px-14"
    >
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="assigned-title" className="font-heading text-lg font-semibold">
            Mes tâches assignées
          </h2>
          <p className="text-muted text-base">Par ordre de priorité</p>
        </div>
        <label className="border-line flex h-[63px] w-full items-center gap-2 rounded-[8px] border px-8 sm:w-[357px]">
          <span className="sr-only">Rechercher une tâche</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une tâche"
            className="placeholder:text-muted flex-1 bg-transparent text-sm outline-none"
          />
          <SearchIcon className="text-muted size-4" />
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted py-10 text-center">
          {tasks.length === 0 ? "Aucune tâche ne vous est assignée." : "Aucune tâche ne correspond à votre recherche."}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {filtered.map((task) => (
            <li key={task.id}>
              <TaskCard task={task} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: "TODO", title: "À faire" },
  { status: "IN_PROGRESS", title: "En cours" },
  { status: "DONE", title: STATUS_LABELS.DONE + "s" },
];

function isInCurrentMonth(iso: string | null): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getUTCFullYear() === now.getFullYear() && d.getUTCMonth() === now.getMonth();
}

function KanbanView({ tasks }: { tasks: Task[] }) {
  // Spécification : "tâches du mois". Le filtre "Toutes" permet de voir
  // les données du seed, dont les échéances sont en 2024.
  const [onlyThisMonth, setOnlyThisMonth] = useState(true);
  const monthLabel = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const visible = onlyThisMonth ? tasks.filter((t) => isInCurrentMonth(t.dueDate)) : tasks;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted">Échéances :</span>
        <FilterPill active={onlyThisMonth} onClick={() => setOnlyThisMonth(true)}>
          {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
        </FilterPill>
        <FilterPill active={!onlyThisMonth} onClick={() => setOnlyThisMonth(false)}>
          Toutes
        </FilterPill>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {COLUMNS.map(({ status, title }) => {
          const columnTasks = visible.filter((t) => t.status === status);
          return (
            <section
              key={status}
              aria-label={title}
              className="border-line bg-surface rounded-[10px] border px-4 py-10 sm:px-6"
            >
              <h2 className="font-heading mb-10 flex items-center gap-2 text-lg font-semibold">
                {title}
                <span className="bg-line text-muted rounded-full px-3 py-0.5 text-sm font-normal">
                  {columnTasks.length}
                </span>
              </h2>
              {columnTasks.length === 0 ? (
                <p className="text-muted text-sm">Aucune tâche</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {columnTasks.map((task) => (
                    <li key={task.id}>
                      <TaskCard task={task} variant="kanban" />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full px-3 py-1 transition ${
        active ? "bg-dark text-white" : "bg-surface border-line border"
      }`}
    >
      {children}
    </button>
  );
}

function ProjectsView({ projects }: { projects: Project[] }) {
  return (
    <section
      aria-labelledby="projects-title"
      className="border-line bg-surface rounded-[10px] border px-4 py-10 sm:px-14"
    >
      <div className="mb-10">
        <h2 id="projects-title" className="font-heading text-lg font-semibold">
          Mes projets en cours
        </h2>
        <p className="text-muted text-base">Projets où des tâches vous sont assignées, les plus urgents d&apos;abord</p>
      </div>

      {projects.length === 0 ? (
        <p className="text-muted py-10 text-center">Aucune tâche ne vous est assignée pour le moment.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {projects.map((project) => (
            <li key={project.id}>
              <DashboardProjectCard project={project} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Tâches à traiter d'abord, puis par échéance la plus proche (sans échéance à la fin) */
function sortForProjectCard(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (isPending(a) !== isPending(b)) return isPending(a) ? -1 : 1;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });
}

function DashboardProjectCard({ project }: { project: Project }) {
  const tasks = project.tasks ?? [];
  const pending = tasks.filter(isPending);
  const overdue = tasks.filter(isOverdue);
  const next = nextDueDate(tasks);
  const titleId = `dashboard-project-${project.id}`;

  return (
    <article aria-labelledby={titleId} className="border-line rounded-[10px] border px-5 py-6 sm:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 id={titleId} className="font-heading text-lg font-semibold">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-muted mt-1 line-clamp-2 text-sm">{project.description}</p>
          )}
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span>
              {pending.length} tâche{pending.length > 1 ? "s" : ""} à traiter sur {tasks.length}
            </span>
            {next && (
              <span className="border-line flex items-center gap-1 border-l pl-3">
                <CalendarIcon className="size-3.5" />
                Prochaine échéance : <time dateTime={next}>{formatShortDate(next)}</time>
              </span>
            )}
            {overdue.length > 0 && (
              <span className="bg-status-todo-bg text-status-todo rounded-full px-3 py-0.5">
                {overdue.length} en retard
              </span>
            )}
          </p>
        </div>
        <Link
          href={`/projects/${project.id}`}
          className="bg-dark inline-flex h-[50px] shrink-0 items-center justify-center rounded-[10px] px-6 text-sm text-white transition hover:opacity-90"
        >
          Voir le projet<span className="sr-only"> {project.name}</span>
        </Link>
      </div>

      {/* Mes tâches dans ce projet, les plus proches de l'échéance d'abord */}
      <ul className="border-line mt-5 flex flex-col gap-2 border-t pt-5">
        {sortForProjectCard(tasks).map((task) => (
            <li key={task.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="min-w-0 truncate">{task.title}</span>
              <span className="flex items-center gap-3">
                {task.dueDate && (
                  <time
                    dateTime={task.dueDate}
                    className={`text-xs ${isOverdue(task) ? "text-status-todo" : "text-muted"}`}
                  >
                    {formatShortDate(task.dueDate)}
                  </time>
                )}
                <StatusBadge status={task.status} />
              </span>
            </li>
          ))}
      </ul>
    </article>
  );
}