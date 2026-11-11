"use client";

import { Project } from "@/src/types/api";
import { useCallback, useState, useTransition } from "react";
import Modal from "../ui/Modal";
import ProjectForm from "./ProjectForm";
import { deleteProject, updateProject } from "@/src/app/actions/projects";

type Props = {
  project: Project;
  canDelete: boolean;
};

/** Lien "Modifier" + modale "Modifier un projet" (admins du projet uniquement) */
export default function EditProjectButton({ project, canDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const [deleting, startDelete] = useTransition();
  const close = useCallback(() => {
    setOpen(false);
    setConfirming(false);
    setDeleteError(undefined);
  }, []);

  const contributors = project.members.map((m) => m.user).filter((u) => u.id !== project.ownerId);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-primary text-xs underline"
      >
        Modifier
      </button>
      <Modal open={open} onClose={close} title="Modifier un projet">
        <ProjectForm
          action={updateProject.bind(null, project.id)}
          submitLabel="Enregistrer"
          pendingLabel="Enregistrement…"
          defaults={{
            name: project.name,
            description: project.description ?? "",
            contributors,
          }}
          onSuccess={close}
        />

        {canDelete && (
          <div className="border-line mt-10 border-t pt-6">
            {!confirming ? (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="text-status-todo text-sm underline"
              >
                Supprimer le projet
              </button>
            ) : (
              <div role="alert" className="flex flex-col gap-3">
                <p className="text-sm">
                  Supprimer définitivement « {project.name} » et toutes ses tâches ?
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() =>
                      startDelete(async () => {
                        const result = await deleteProject(project.id);
                        if (result?.error) setDeleteError(result.error);
                      })
                    }
                    className="bg-status-todo h-[40px] rounded-[10px] px-4 text-sm text-white disabled:opacity-60"
                  >
                    {deleting ? "Suppression…" : "Oui, supprimer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="border-line h-[40px] rounded-[10px] border px-4 text-sm"
                  >
                    Annuler
                  </button>
                </div>
                {deleteError && <p className="text-status-todo text-xs">{deleteError}</p>}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
