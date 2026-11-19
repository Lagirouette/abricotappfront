"use client";

import { useCallback, useId, useState } from "react";
import Modal from "../ui/Modal";
import { ArrowUpIcon, PencilIcon, SparkleIcon, TrashIcon } from "../icons";

/*
 * Création de tâches par IA : INTERFACE UNIQUEMENT (maquettes "Modale création de tâche IA"
 * et "Modale liste de tâche IA").
 * Le backend ne propose aucun endpoint pour générer des tâches : rien n'est envoyé.
 * - Étape "prompt" : l'utilisateur décrit les tâches voulues.
 * - Étape "results" : affiche des tâches d'exemple, comme sur la maquette.
 * Les boutons Supprimer / Modifier / Ajouter les tâches ne font rien pour l'instant.
 */

type Step = "prompt" | "results";

// Tâches d'exemple affichées à la place d'une vraie réponse de l'IA (contenu de la maquette)
const PLACEHOLDER_TASKS = [
  { id: "exemple-1", title: "Nom de la tâche", description: "Description de la tâche" },
  { id: "exemple-2", title: "Nom de la tâche", description: "Description de la tâche" },
  { id: "exemple-3", title: "Nom de la tâche", description: "Description de la tâche" },
];

/** Bouton orange "IA" + modales de création de tâches par IA */
export default function AiTaskButton() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("prompt");

  const close = useCallback(() => {
    setOpen(false);
    setStep("prompt");
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Créer des tâches avec l'IA"
        className="bg-primary flex h-[50px] items-center gap-2 rounded-[10px] px-6 text-sm text-white transition hover:opacity-90"
      >
        <SparkleIcon />
        IA
      </button>

      <Modal
        open={open}
        onClose={close}
        title={
          <span className="flex items-center gap-2">
            <SparkleIcon className="text-primary size-5" />
            {step === "prompt" ? "Créer une tâche" : "Vos tâches..."}
          </span>
        }
      >
        {step === "prompt" ? (
          <div className="flex min-h-[260px] flex-col justify-end">
            <PromptBar onSubmit={() => setStep("results")} />
          </div>
        ) : (
          <div className="flex flex-col">
            <ul className="flex flex-col gap-4">
              {PLACEHOLDER_TASKS.map((task) => (
                <li key={task.id} className="border-line rounded-[10px] border px-6 py-5">
                  <h3 className="font-heading font-semibold">{task.title}</h3>
                  <p className="text-muted mt-1 text-sm">{task.description}</p>
                  <div className="text-muted mt-4 flex items-center gap-3 text-xs">
                    {/* Pas encore d'action : fonctionnalité IA non disponible */}
                    <button type="button" className="hover:text-dark flex items-center gap-1">
                      <TrashIcon /> Supprimer
                    </button>
                    <span aria-hidden className="bg-line h-3 w-px" />
                    <button type="button" className="hover:text-dark flex items-center gap-1">
                      <PencilIcon /> Modifier
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="bg-dark mx-auto mt-6 h-[45px] rounded-[10px] px-6 text-sm text-white transition hover:opacity-90"
            >
              + Ajouter les tâches
            </button>

            <div className="border-line mt-8 border-t pt-6">
              <PromptBar onSubmit={() => setStep("results")} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

/** Zone de saisie arrondie avec le bouton d'envoi orange (bas des deux modales) */
function PromptBar({ onSubmit }: { onSubmit: () => void }) {
  const [prompt, setPrompt] = useState("");
  const inputId = useId();

  return (
    <form
      className="bg-background flex items-center gap-3 rounded-full py-2 pr-2 pl-6"
      onSubmit={(e) => {
        e.preventDefault(); // aucun envoi : pas d'endpoint IA côté backend
        if (!prompt.trim()) return;
        setPrompt("");
        onSubmit();
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        Décrivez les tâches que vous souhaitez ajouter
      </label>
      <input
        id={inputId}
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Décrivez les tâches que vous souhaitez ajouter..."
        className="placeholder:text-muted min-w-0 flex-1 bg-transparent text-sm outline-none"
      />
      <button
        type="submit"
        aria-label="Envoyer la demande"
        className="bg-primary flex size-8 shrink-0 items-center justify-center rounded-full text-white transition hover:opacity-90"
      >
        <ArrowUpIcon />
      </button>
    </form>
  );
}
