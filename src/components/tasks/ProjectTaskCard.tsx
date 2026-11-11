"use client";

import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
import { CalendarIcon, ChevronDownIcon } from "../icons";
import { deleteTask, updateTask } from "@/src/app/actions/tasks";
import type { Task, User } from "@/src/types/api";
import { displayName, formatShortDate } from "@/src/lib/format";
import ConfirmModal from "../ui/ConfirmModal";
import Avatar from "../ui/Avatar";
import StatusBadge from "./StatusBadge";
import TaskForm from "./TaskForm";
import CommentSection from "./CommentSection";
import Modal from "../ui/Modal";

type Props = {
  task: Task;
  projectId: string;
  people: User[];
  currentUserId: string;
};

export default function ProjectTaskCard({ task, projectId, people, currentUserId }: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const [deleting, startDelete] = useTransition();
  const [showComments, setShowComments] = useState(false);
  const commentsId = useId();
  const closeEdit = useCallback(() => setEditing(false), []);

  return (
    <article className="border-line bg-surface rounded-[10px] border px-5 pt-6 sm:px-10">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-heading text-lg font-semibold">{task.title}</h3>
            <StatusBadge status={task.status} />
          </div>
          {task.description && <p className="text-muted mt-1 text-sm">{task.description}</p>}
        </div>
        <TaskMenu
          taskTitle={task.title}
          onEdit={() => setEditing(true)}
          onDelete={() => setConfirmDelete(true)}
        />
      </div>

      <dl className="mt-6 flex flex-col gap-4 text-xs">
        {task.dueDate && (
          <div className="flex items-center gap-2">
            <dt className="text-muted">Échéance :</dt>
            <dd className="flex items-center gap-1">
              <CalendarIcon className="size-3.5" />
              <time dateTime={task.dueDate}>{formatShortDate(task.dueDate)}</time>
            </dd>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <dt className="text-muted">Assigné à :</dt>
          {task.assignees.length === 0 ? (
            <dd className="text-muted">Personne</dd>
          ) : (
            task.assignees.map(({ user }) => (
              <dd key={user.id} className="bg-line flex items-center gap-1.5 rounded-full py-0.5 pr-3 pl-0.5">
                <Avatar user={user} className="size-[22px] border-0" />
                {displayName(user)}
              </dd>
            ))
          )}
        </div>
      </dl>

      <div className="border-line mt-6 border-t">
        <button
          type="button"
          aria-expanded={showComments}
          aria-controls={commentsId}
          onClick={() => setShowComments((s) => !s)}
          className="flex w-full items-center justify-between py-5 text-sm"
        >
          Commentaires ({task.comments.length})
          <ChevronDownIcon className={`size-4 transition ${showComments ? "rotate-180" : ""}`} />
        </button>
        <div id={commentsId} hidden={!showComments} className="pb-6">
          {showComments && (
            <CommentSection
              projectId={projectId}
              taskId={task.id}
              comments={task.comments}
              currentUserId={currentUserId}
            />
          )}
        </div>
      </div>

      <Modal open={editing} onClose={closeEdit} title="Modifier">
        <TaskForm
          action={updateTask.bind(null, projectId, task.id)}
          people={people}
          task={task}
          submitLabel="Enregistrer"
          pendingLabel="Enregistrement…"
          onSuccess={closeEdit}
        />
      </Modal>

      <ConfirmModal
        open={confirmDelete}
        title="Supprimer la tâche"
        message={<>Supprimer définitivement la tâche « {task.title} » ?</>}
        confirmLabel="Supprimer"
        pending={deleting}
        error={deleteError}
        onClose={() => {
          setConfirmDelete(false);
          setDeleteError(undefined);
        }}
        onConfirm={() =>
          startDelete(async () => {
            const result = await deleteTask(projectId, task.id);
            if (result.error) setDeleteError(result.error);
            else setConfirmDelete(false);
          })
        }
      />
    </article>
  );
}

function TaskMenu({ taskTitle, onEdit, onDelete }: { taskTitle: string; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Actions pour la tâche ${taskTitle}`}
        onClick={() => setOpen((o) => !o)}
        className="border-line hover:bg-background flex size-[57px] items-center justify-center rounded-[10px] border text-lg leading-none"
      >
        …
      </button>
      {open && (
        <ul
          id={menuId}
          role="menu"
          className="border-line bg-surface absolute right-0 z-10 mt-1 w-40 rounded-[10px] border py-1 shadow-lg"
        >
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="hover:bg-background w-full px-4 py-2 text-left text-sm"
            >
              Modifier
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="text-status-todo hover:bg-background w-full px-4 py-2 text-left text-sm"
            >
              Supprimer
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
