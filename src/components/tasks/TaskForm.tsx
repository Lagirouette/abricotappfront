"use client";

import { TaskFormState } from "@/src/app/actions/tasks";
import { Task, TaskStatus, User } from "@/src/types/api";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import TextField from "../ui/TextField";
import Avatar from "../ui/Avatar";
import { displayName, STATUS_LABELS } from "@/src/lib/format";
import { ChevronDownIcon } from "../icons";
type Props = {
  action: (state: TaskFormState, formData: FormData) => Promise<TaskFormState>;
  people: User[];
  task?: Task;
  submitLabel: string;
  pendingLabel: string;
  onSuccess: () => void;
};

function toDateInput(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : "";
}

export default function TaskForm({ action, people, task, submitLabel, pendingLabel, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(toDateInput(task?.dueDate));

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state, onSuccess]);

  const canSubmit = title.trim() !== "" && description.trim() !== "" && dueDate !== "" && !pending;

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <TextField id="task-title" name="title" label="Titre*" value={title} onChange={setTitle} error={state.fieldErrors?.title} />
      <TextField
        id="task-description"
        name="description"
        label="Description*"
        value={description}
        onChange={setDescription}
        error={state.fieldErrors?.description}
      />
      <TextField
        id="task-due-date"
        name="dueDate"
        type="date"
        label="Échéance*"
        value={dueDate}
        onChange={setDueDate}
        error={state.fieldErrors?.dueDate}
      />
      <AssigneePicker
        people={people}
        defaultIds={task?.assignees.map((a) => a.user.id) ?? []}
      />
      <StatusPicker defaultStatus={task?.status ?? "TODO"} />

      {state.error && (
        <p role="alert" className="text-status-todo text-sm">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="bg-dark disabled:bg-line disabled:text-muted mt-4 h-[50px] w-[181px] rounded-[10px] text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed"
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}

function AssigneePicker({ people, defaultIds }: { people: User[]; defaultIds: string[] }) {
  const [selected, setSelected] = useState<string[]>(defaultIds);
  const [open, setOpen] = useState(false);
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const summary =
    selected.length === 0
      ? "Choisir un ou plusieurs collaborateurs"
      : `${selected.length} collaborateur${selected.length > 1 ? "s" : ""}`;

  return (
    <div className="flex flex-col gap-2" ref={wrapperRef}>
      <span className="text-sm" id={`${listId}-label`}>
        Assigné à :
      </span>
      <div className="relative">
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={`${listId}-label ${listId}-summary`}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && open) {
              e.preventDefault(); // ne ferme pas la modale
              setOpen(false);
            }
          }}
          className="border-line focus:border-primary flex h-[53px] w-full items-center justify-between rounded-[4px] border bg-white px-4 text-left text-sm outline-none"
        >
          <span id={`${listId}-summary`} className={selected.length ? "" : "text-muted"}>
            {summary}
          </span>
          <ChevronDownIcon className="text-muted size-4" />
        </button>

        <fieldset
          id={listId}
          className={`border-line bg-surface absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-[4px] border py-1 shadow-lg ${
            open ? "" : "hidden"
          }`}
        >
          <legend className="sr-only">Collaborateurs assignés</legend>
          {people.map((user) => (
            <label key={user.id} className="hover:bg-background flex cursor-pointer items-center gap-3 px-4 py-2 text-sm">
              <input
                type="checkbox"
                name="assigneeIds"
                value={user.id}
                checked={selected.includes(user.id)}
                onChange={() => toggle(user.id)}
                className="accent-primary"
              />
              <Avatar user={user} />
              {displayName(user)}
            </label>
          ))}
        </fieldset>
      </div>
    </div>
  );
}

const STATUS_STYLES: Record<Exclude<TaskStatus, "CANCELLED">, string> = {
  TODO: "bg-status-todo-bg text-status-todo",
  IN_PROGRESS: "bg-status-progress-bg text-status-progress",
  DONE: "bg-status-done-bg text-status-done",
};

function StatusPicker({ defaultStatus }: { defaultStatus: TaskStatus }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm">Statut :</legend>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(STATUS_STYLES) as (keyof typeof STATUS_STYLES)[]).map((status) => (
          <label key={status} className="cursor-pointer">
            <input
              type="radio"
              name="status"
              value={status}
              defaultChecked={defaultStatus === status}
              className="peer sr-only"
            />
            <span
              className={`peer-checked:ring-dark peer-focus-visible:outline-primary inline-flex h-[25px] items-center rounded-full px-4 text-xs peer-checked:ring-1 peer-focus-visible:outline-2 ${STATUS_STYLES[status]}`}
            >
              {STATUS_LABELS[status]}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
