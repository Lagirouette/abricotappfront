"use client";

import { useCallback, useId, useState } from "react";
import { addAiTasks, generateAiTasks, type AiTaskSuggestion } from "@/src/app/actions/ai";
import { formatShortDate } from "@/src/lib/format";
import Modal from "../ui/Modal";
import TextField from "../ui/TextField";
import { ArrowUpIcon, PencilIcon, SparkleIcon, TrashIcon } from "../icons";

type Step = "prompt" | "results";

// Une suggestion de l'IA + un identifiant local (pour la liste React et l'édition)
type Suggestion = AiTaskSuggestion & { key: string };

/**
 * Bouton "IA" + modales de création de tâches par IA (maquettes).
 * 1. L'utilisateur décrit ce qu'il veut : Google Gemini propose des tâches (generateAiTasks).
 * 2. Il supprime ou modifie les propositions, puis "Ajouter les tâches" crée
 *    dans le projet uniquement celles qu'il a gardées (addAiTasks).
 */
export default function AiTaskButton({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("prompt");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const [generating, setGenerating] = useState(false);
  const [adding, setAdding] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    setStep("prompt");
    setSuggestions([]);
    setEditingKey(null);
    setError(undefined);
  }, []);

  // Renvoie true si la génération a réussi (la zone de saisie se vide alors)
  async function generate(prompt: string): Promise<boolean> {
    setError(undefined);
    setGenerating(true);
    const result = await generateAiTasks(projectId, prompt);
    setGenerating(false);
    if (result.error || !result.tasks) {
      setError(result.error);
      return false;
    }
    setSuggestions(result.tasks.map((task) => ({ ...task, key: crypto.randomUUID() })));
    setEditingKey(null);
    setStep("results");
    return true;
  }

  async function addSelected() {
    setError(undefined);
    setAdding(true);
    const result = await addAiTasks(
      projectId,
      suggestions.map(({ title, description, dueDate }) => ({ title, description, dueDate }))
    );
    setAdding(false);
    if (result.error) setError(result.error);
    else close(); // la page se recharge (refresh) et affiche les nouvelles tâches
  }

  function remove(key: string) {
    setSuggestions((prev) => prev.filter((s) => s.key !== key));
  }

  function save(updated: Suggestion) {
    setSuggestions((prev) => prev.map((s) => (s.key === updated.key ? updated : s)));
    setEditingKey(null);
  }

  const busy = generating || adding;

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
          // Grand espace comme sur la maquette, messages au centre, saisie en bas
          <div className="flex min-h-[260px] flex-col justify-end gap-4">
            <Status generating={generating} error={error} />
            <PromptBar onSubmit={generate} disabled={busy} />
          </div>
        ) : (
          <div className="flex flex-col">
            {suggestions.length === 0 ? (
              <p className="text-muted py-6 text-center text-sm">
                Toutes les propositions ont été retirées. Décrivez à nouveau votre besoin ci-dessous.
              </p>
            ) : (
              <ul aria-label="Tâches proposées par l'IA" className="flex flex-col gap-4">
                {suggestions.map((task) =>
                  editingKey === task.key ? (
                    <li key={task.key}>
                      <SuggestionEditor task={task} onSave={save} onCancel={() => setEditingKey(null)} />
                    </li>
                  ) : (
                    <li key={task.key} className="border-line rounded-[10px] border px-6 py-5">
                      <h3 className="font-heading font-semibold">{task.title}</h3>
                      <p className="text-muted mt-1 text-sm">{task.description}</p>
                      {task.dueDate && (
                        <p className="text-muted mt-2 text-xs">
                          Échéance : <time dateTime={task.dueDate}>{formatShortDate(task.dueDate)}</time>
                        </p>
                      )}
                      <div className="text-muted mt-4 flex items-center gap-3 text-xs">
                        <button
                          type="button"
                          onClick={() => remove(task.key)}
                          disabled={busy}
                          aria-label={`Supprimer la proposition « ${task.title} »`}
                          className="hover:text-dark flex items-center gap-1"
                        >
                          <TrashIcon /> Supprimer
                        </button>
                        <span aria-hidden className="bg-line h-3 w-px" />
                        <button
                          type="button"
                          onClick={() => setEditingKey(task.key)}
                          disabled={busy}
                          aria-label={`Modifier la proposition « ${task.title} »`}
                          className="hover:text-dark flex items-center gap-1"
                        >
                          <PencilIcon /> Modifier
                        </button>
                      </div>
                    </li>
                  )
                )}
              </ul>
            )}

            <button
              type="button"
              onClick={addSelected}
              disabled={busy || suggestions.length === 0 || editingKey !== null}
              className="bg-dark disabled:bg-line disabled:text-muted mx-auto mt-6 h-[45px] rounded-[10px] px-6 text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed"
            >
              {adding ? "Ajout en cours…" : `+ Ajouter les tâches (${suggestions.length})`}
            </button>

            <div className="border-line mt-8 flex flex-col gap-4 border-t pt-6">
              <Status generating={generating} error={error} />
              <PromptBar onSubmit={generate} disabled={busy} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

/** Message de chargement ou d'erreur, annoncé aux lecteurs d'écran */
function Status({ generating, error }: { generating: boolean; error?: string }) {
  return (
    <div aria-live="polite" className="text-center text-sm">
      {generating && <p className="text-muted">Génération des tâches en cours…</p>}
      {!generating && error && <p className="text-status-todo">{error}</p>}
    </div>
  );
}

/** Formulaire de modification d'une proposition, affiché à la place de sa carte */
function SuggestionEditor({
  task,
  onSave,
  onCancel,
}: {
  task: Suggestion;
  onSave: (task: Suggestion) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const canSave = title.trim().length >= 2;

  return (
    <form
      className="border-primary flex flex-col gap-4 rounded-[10px] border px-6 py-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSave) onSave({ ...task, title: title.trim(), description: description.trim(), dueDate });
      }}
    >
      <TextField id="ai-title" name="title" label="Titre" value={title} onChange={setTitle} />
      <TextField
        id="ai-description"
        name="description"
        label="Description"
        value={description}
        onChange={setDescription}
        required={false}
      />
      <TextField
        id="ai-due-date"
        name="dueDate"
        type="date"
        label="Échéance"
        value={dueDate}
        onChange={setDueDate}
        required={false}
      />
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!canSave}
          className="bg-dark disabled:bg-line disabled:text-muted h-[40px] rounded-[10px] px-4 text-sm text-white"
        >
          Enregistrer
        </button>
        <button type="button" onClick={onCancel} className="border-line h-[40px] rounded-[10px] border px-4 text-sm">
          Annuler
        </button>
      </div>
    </form>
  );
}

/** Zone de saisie arrondie avec le bouton d'envoi orange (bas des deux modales) */
function PromptBar({
  onSubmit,
  disabled,
}: {
  onSubmit: (prompt: string) => Promise<boolean>;
  disabled: boolean;
}) {
  const [prompt, setPrompt] = useState("");
  const inputId = useId();

  return (
    <form
      className="bg-background flex items-center gap-3 rounded-full py-2 pr-2 pl-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!prompt.trim() || disabled) return;
        // On ne vide le champ qu'en cas de succès : en cas d'erreur, la demande reste
        if (await onSubmit(prompt)) setPrompt("");
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        Décrivez les tâches que vous souhaitez ajouter
      </label>
      <input
        id={inputId}
        type="text"
        value={prompt}
        maxLength={1000}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Décrivez les tâches que vous souhaitez ajouter..."
        className="placeholder:text-muted min-w-0 flex-1 bg-transparent text-sm outline-none"
      />
      <button
        type="submit"
        disabled={disabled || !prompt.trim()}
        aria-label="Envoyer la demande"
        className="bg-primary flex size-8 shrink-0 items-center justify-center rounded-full text-white transition hover:opacity-90 disabled:opacity-50"
      >
        <ArrowUpIcon />
      </button>
    </form>
  );
}
