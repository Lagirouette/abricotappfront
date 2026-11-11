"use client";

import { useCallback, useState } from "react";
import ProjectForm from "./ProjectForm";
import Modal from "../ui/Modal";
import { createProject } from "@/src/app/actions/projects";

export default function CreateProjectButton() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-dark flex h-[50px] items-center rounded-[10px] px-6 text-sm text-white transition hover:opacity-90"
      >
        + Créer un projet
      </button>
      <Modal open={open} onClose={close} title="Créer un projet">
        <ProjectForm
          action={createProject}
          submitLabel="Ajouter un projet"
          pendingLabel="Création…"
          onSuccess={close}
        />
      </Modal>
    </>
  );
}
