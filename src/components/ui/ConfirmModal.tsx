"use client";

import Modal from "./Modal";

type Props = {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  pending?: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmModal({ open, title, message, confirmLabel, pending, error, onConfirm, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm">{message}</p>
      {error && (
        <p role="alert" className="text-status-todo mt-4 text-sm">
          {error}
        </p>
      )}
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className="bg-status-todo h-[50px] rounded-[10px] px-6 text-sm text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Suppression…" : confirmLabel}
        </button>
        <button type="button" onClick={onClose} className="border-line h-[50px] rounded-[10px] border px-6 text-sm">
          Annuler
        </button>
      </div>
    </Modal>
  );
}
