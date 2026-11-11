"use client";

import { useActionState, useEffect, useState } from "react";
import ContributorPicker from "./ContributorPicker";
import Modal from "../ui/Modal";
import { createProject, ProjectFormState } from "@/src/app/actions/projects";

export default function CreateProjectButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-dark flex h-[50px] items-center rounded-[10px] px-6 text-sm text-white transition hover:opacity-90"
      >
        + Créer un projet
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Créer un projet">
        <CreateProjectForm onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}

function CreateProjectForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction, pending] = useActionState<ProjectFormState, FormData>(
    createProject,
    {}
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state, onSuccess]);

  const canSubmit = name.trim() !== "" && description.trim() !== "" && !pending;

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <TextField
        id="project-name"
        name="name"
        label="Titre*"
        value={name}
        onChange={setName}
        error={state.fieldErrors?.name}
      />
      <TextField
        id="project-description"
        name="description"
        label="Description*"
        value={description}
        onChange={setDescription}
        error={state.fieldErrors?.description}
      />
      <ContributorPicker name="contributors" error={state.fieldErrors?.contributors} />

      {state.error && !state.fieldErrors?.name && !state.fieldErrors?.description && (
        <p role="alert" className="text-status-todo text-sm">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="bg-dark disabled:bg-line disabled:text-muted mt-4 h-[50px] w-[181px] rounded-[10px] text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed"
      >
        {pending ? "Création…" : "Ajouter un projet"}
      </button>
    </form>
  );
}

function TextField({
  id,
  name,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <input
        id={id}
        name={name}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="border-line focus:border-primary aria-[invalid=true]:border-status-todo h-[53px] rounded-[4px] border bg-white px-4 text-sm outline-none"
      />
      {error && (
        <p id={`${id}-error`} className="text-status-todo text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
