"use client";

import { useActionState, useEffect, useState } from "react";
import ContributorPicker from "./ContributorPicker";
import { ProjectFormState } from "@/src/app/actions/projects";
import { User } from "@/src/types/api";
import TextField from "../ui/TextField";

type Props = {
  action: (state: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  submitLabel: string;
  pendingLabel: string;
  defaults?: { name: string; description: string; contributors: User[] };
  onSuccess: () => void;
};

export default function ProjectForm({ action, submitLabel, pendingLabel, defaults, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [name, setName] = useState(defaults?.name ?? "");
  const [description, setDescription] = useState(defaults?.description ?? "");

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
      <ContributorPicker
        name="contributors"
        defaultSelected={defaults?.contributors}
        error={state.fieldErrors?.contributors}
      />

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
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
