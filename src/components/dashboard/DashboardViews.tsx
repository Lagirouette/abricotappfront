"use client";

import { useMemo, useState } from "react";
import type { Task, TaskStatus } from "../../types/api";
import { STATUS_LABELS } from "../../lib/format";
import { CalendarIcon, ListIcon, SearchIcon } from "../../components/icons";
import TaskCard from "../../components/tasks/TaskCard";

type View = "list" | "kanban";

export default function DashboardViews({ tasks }: { tasks: Task[] }) {
  const [view, setView] = useState<View>("list");

  return (
    <>
      <div role="tablist" aria-label="Affichage des tâches" className="mt-14 mb-10 flex gap-2">
        <ViewTab active={view === "list"} onClick={() => setView("list")}>
          <ListIcon /> Liste
        </ViewTab>
        <ViewTab active={view === "kanban"} onClick={() => setView("kanban")}>
          <CalendarIcon /> Kanban
        </ViewTab>
      </div>

      {view === "list" ? <ListView tasks={tasks} /> : <KanbanView tasks={tasks} />}
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
      role="tab"
      aria-selected={active}
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
