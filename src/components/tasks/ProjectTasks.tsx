"use client";

import { useCallback, useMemo, useState } from "react";
import { updateTask } from "@/src/app/actions/tasks";
import { CalendarIcon, ListIcon, SearchIcon } from "../icons";
import Modal from "../ui/Modal";
import type { Task, TaskStatus, User } from "@/src/types/api";
import ProjectTaskCard from "./ProjectTaskCard";
import TaskCalendar from "./TaskCalendar";
import TaskForm from "./TaskForm";
import { STATUS_LABELS } from "@/src/lib/format";

type Props = {
  projectId: string;
  tasks: Task[];
  people: User[];
  currentUserId: string;
  /** Administrateur du projet : peut modifier les tâches (les contributeurs non) */
  canEdit: boolean;
};

type View = "list" | "calendar";

export default function ProjectTasks({ projectId, tasks, people, currentUserId, canEdit }: Props) {
  const [view, setView] = useState<View>("list");
  const [status, setStatus] = useState<TaskStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Task | null>(null);
  const closeSelected = useCallback(() => setSelected(null), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter(
      (t) =>
        (status === "ALL" || t.status === status) &&
        (!q || t.title.toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q))
    );
  }, [tasks, status, query]);

  return (
    <section
      aria-labelledby="tasks-title"
      className="border-line bg-surface mt-8 rounded-[10px] border px-4 py-10 sm:px-14"
    >
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="tasks-title" className="font-heading text-lg font-semibold">
            Tâches
          </h2>
          <p className="text-muted">Par ordre de priorité</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div role="group" aria-label="Affichage des tâches" className="flex gap-2">
            <ViewTab active={view === "list"} onClick={() => setView("list")}>
              <ListIcon /> Liste
            </ViewTab>
            <ViewTab active={view === "calendar"} onClick={() => setView("calendar")}>
              <CalendarIcon /> Calendrier
            </ViewTab>
          </div>

          <label className="sr-only" htmlFor="status-filter">
            Filtrer par statut
          </label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus | "ALL")}
            className="border-line focus:border-primary h-[53px] rounded-[8px] border bg-white px-4 text-sm outline-none"
          >
            <option value="ALL">Statut</option>
            {(["TODO", "IN_PROGRESS", "DONE"] as const).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>

          <label className="border-line flex h-[53px] w-full items-center gap-2 rounded-[8px] border px-5 sm:w-[283px]">
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
      </div>

      {view === "list" ? (
        filtered.length === 0 ? (
          <p className="text-muted py-10 text-center">
            {tasks.length === 0 ? "Aucune tâche dans ce projet pour le moment." : "Aucune tâche ne correspond à ces critères."}
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {filtered.map((task) => (
              <li key={task.id}>
                <ProjectTaskCard
                  task={task}
                  projectId={projectId}
                  people={people}
                  currentUserId={currentUserId}
                  canEdit={canEdit}
                />
              </li>
            ))}
          </ul>
        )
      ) : (
        <TaskCalendar tasks={filtered} onSelect={canEdit ? setSelected : undefined} />
      )}

      {/* Clic sur une tâche du calendrier : ouverture de la modale de modification */}
      <Modal open={selected !== null} onClose={closeSelected} title="Modifier">
        {selected && (
          <TaskForm
            action={updateTask.bind(null, projectId, selected.id)}
            people={people}
            task={selected}
            submitLabel="Enregistrer"
            pendingLabel="Enregistrement…"
            onSuccess={closeSelected}
          />
        )}
      </Modal>
    </section>
  );
}

function ViewTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`text-primary flex h-[45px] items-center gap-2 rounded-[4px] px-4 text-sm transition ${
        active ? "bg-primary-light" : "hover:bg-primary-light/60"
      }`}
    >
      {children}
    </button>
  );
}
