"use client";

import { useCallback, useState } from "react";
import { createTask } from "@/src/app/actions/tasks";
import type { User } from "@/src/types/api";
import Modal from "../ui/Modal";
import TaskForm from "./TaskForm";

export default function CreateTaskButton({ projectId, people }: { projectId: string; people: User[] }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-dark flex h-[50px] items-center rounded-[10px] px-6 text-sm text-white transition hover:opacity-90"
      >
        Créer une tâche
      </button>
      <Modal open={open} onClose={close} title="Créer une tâche">
        <TaskForm
          action={createTask.bind(null, projectId)}
          people={people}
          submitLabel="+ Ajouter une tâche"
          pendingLabel="Création…"
          onSuccess={close}
        />
      </Modal>
    </>
  );
}
