"use client";

import { addComment, CommentFormState, deleteComment } from "@/src/app/actions/tasks";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { CloseIcon } from "../icons";
import Avatar from "../ui/Avatar";
import { Comment } from "@/src/types/api";
import { displayName } from "@/src/lib/format";

type Props = {
  projectId: string;
  taskId: string;
  comments: Comment[];
  currentUserId: string;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommentSection({ projectId, taskId, comments, currentUserId }: Props) {
  const [state, formAction, pending] = useActionState<CommentFormState, FormData>(
    addComment.bind(null, projectId, taskId),
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <div className="flex flex-col gap-4 pt-4">
      {comments.length === 0 ? (
        <p className="text-muted text-sm">Aucun commentaire pour le moment.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              canDelete={comment.author.id === currentUserId}
              onDelete={() => deleteComment(projectId, taskId, comment.id)}
            />
          ))}
        </ul>
      )}

      <form ref={formRef} action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="sr-only">Ajouter un commentaire</span>
          <textarea
            name="content"
            rows={2}
            required
            placeholder="Ajouter un commentaire…"
            className="border-line focus:border-primary w-full resize-y rounded-[4px] border bg-white px-4 py-3 text-sm outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="bg-dark h-[44px] shrink-0 rounded-[10px] px-5 text-sm text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Envoi…" : "Envoyer"}
        </button>
      </form>
      {state.error && (
        <p role="alert" className="text-status-todo text-xs">
          {state.error}
        </p>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  canDelete,
  onDelete,
}: {
  comment: Comment;
  canDelete: boolean;
  onDelete: () => Promise<{ error?: string }>;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <li className="bg-background flex gap-3 rounded-[10px] p-3">
      <Avatar user={comment.author} />
      <div className="min-w-0 flex-1">
        <p className="text-xs">
          <span className="font-semibold">{displayName(comment.author)}</span>
          <time dateTime={comment.createdAt} className="text-muted ml-2">
            {formatDateTime(comment.createdAt)}
          </time>
        </p>
        <p className="mt-1 text-sm break-words whitespace-pre-line">{comment.content}</p>
        {error && <p className="text-status-todo mt-1 text-xs">{error}</p>}
      </div>
      {canDelete && (
        <button
          type="button"
          disabled={pending}
          aria-label="Supprimer mon commentaire"
          onClick={() =>
            startTransition(async () => {
              const result = await onDelete();
              if (result.error) setError(result.error);
            })
          }
          className="text-muted hover:text-status-todo self-start disabled:opacity-50"
        >
          <CloseIcon className="size-3.5" />
        </button>
      )}
    </li>
  );
}
