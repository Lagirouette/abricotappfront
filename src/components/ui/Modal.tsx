"use client";

import { useEffect, useId, useRef } from "react";
import { CloseIcon } from "../icons";

type Props = {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Modale basée sur l'élément natif <dialog> + showModal() :
 * focus piégé dans la modale, fermeture avec Échap et fond assombri gérés par le navigateur.
 * Le contenu n'est monté que lorsque la modale est ouverte (formulaire remis à zéro à chaque ouverture).
 */
export default function Modal({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="bg-surface text-dark m-auto w-[calc(100%-2rem)] max-w-[598px] rounded-[10px] p-0 shadow-xl backdrop:bg-black/40"
    >
      {open && (
        <div className="relative px-6 py-14 sm:px-[73px] sm:py-[79px]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="text-muted hover:text-dark absolute top-6 right-6 rounded p-1"
          >
            <CloseIcon />
          </button>
          <h2 id={titleId} className="font-heading mb-10 text-2xl font-semibold">
            {title}
          </h2>
          {children}
        </div>
      )}
    </dialog>
  );
}
