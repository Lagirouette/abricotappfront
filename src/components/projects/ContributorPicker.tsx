"use client";

import { User } from "@/src/types/api";
import { useEffect, useId, useState } from "react";
import { ChevronDownIcon, CloseIcon } from "../icons";
import Avatar from "../ui/Avatar";
import { displayName } from "@/src/lib/format";

type Props = {
  name: string;
  defaultSelected?: User[];
  error?: string;
};

export default function ContributorPicker({ name, defaultSelected = [], error }: Props) {
  const [selected, setSelected] = useState<User[]>(defaultSelected);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const listId = useId();
  const inputId = useId();

  useEffect(() => {
    const q = query.trim();
    // Moins de 2 caractères : pas d'appel
    if (q.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/search?query=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as { users?: User[] };
        setResults(data.users ?? []);
      } catch {
        // requête annulée ou réseau indisponible : on garde les résultats précédents
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const available = results.filter((u) => !selected.some((s) => s.id === u.id));

  function add(user: User) {
    setSelected((prev) => [...prev, user]);
    setQuery("");
    setOpen(false);
  }

  function remove(id: string) {
    setSelected((prev) => prev.filter((u) => u.id !== id));
  }

  const summary =
    selected.length === 0
      ? "Choisir un ou plusieurs collaborateurs"
      : `${selected.length} collaborateur${selected.length > 1 ? "s" : ""}`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm">
        Contributeurs
      </label>

      <div className="relative">
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open && query.trim().length >= 2}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          placeholder={summary}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (available[0]) add(available[0]);
            }
            if (e.key === "Escape" && open) {
              e.preventDefault();
              setOpen(false);
            }
          }}
          className="border-line focus:border-primary placeholder:text-muted h-[53px] w-full rounded-[4px] border bg-white px-4 pr-10 text-sm outline-none"
        />
        <ChevronDownIcon className="text-muted pointer-events-none size-4 absolute top-1/2 right-4 -translate-y-1/2" />

        {open && query.trim().length >= 2 && (
          <ul
            id={listId}
            role="listbox"
            className="border-line bg-surface absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-[4px] border py-1 shadow-lg"
          >
            {loading && available.length === 0 && (
              <li className="text-muted px-4 py-2 text-sm">Recherche…</li>
            )}
            {!loading && available.length === 0 && (
              <li className="text-muted px-4 py-2 text-sm">Aucun utilisateur trouvé</li>
            )}
            {available.map((user) => (
              <li
                key={user.id}
                role="option"
                aria-selected={false}
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(user);
                }}
                className="hover:bg-background flex cursor-pointer items-center gap-3 px-4 py-2 text-sm"
              >
                <Avatar user={user} />
                <span>
                  {displayName(user)}
                  {user.name && <span className="text-muted ml-2 text-xs">{user.email}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected.length > 0 && (
        <ul aria-label="Collaborateurs choisis" className="flex flex-wrap gap-2">
          {selected.map((user) => (
            <li
              key={user.id}
              className="bg-line flex items-center gap-2 rounded-full py-1 pr-2 pl-1 text-xs"
            >
              <Avatar user={user} className="size-[22px] border-0" />
              {displayName(user)}
              <button
                type="button"
                onClick={() => remove(user.id)}
                aria-label={`Retirer ${displayName(user)}`}
                className="text-muted hover:text-dark"
              >
                <CloseIcon className="size-3" />
              </button>
              <input type="hidden" name={name} value={user.email} />
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-status-todo text-xs">{error}</p>}
    </div>
  );
}
