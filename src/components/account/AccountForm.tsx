"use client";

import { useActionState, useState } from "react";
import { User } from "@/src/types/api";
import { splitName } from "@/src/lib/format";
import { updateAccount, AccountFormState } from "@/src/app/actions/account";
import TextField from "@/src/components/ui/TextField";

export default function AccountForm({ user }: { user: User }) {
  const initial = splitName(user.name);
  const [lastName, setLastName] = useState(initial.lastName);
  const [firstName, setFirstName] = useState(initial.firstName);
  const [email, setEmail] = useState(user.email);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const [state, formAction, pending] = useActionState<AccountFormState, FormData>(
    async (prev, formData) => {
      const result = await updateAccount(prev, formData);
      if (result.success) {
        setNewPassword("");
        setCurrentPassword("");
      }
      return result;
    },
    {}
  );

  const fe = state.fieldErrors;

  return (
    <form action={formAction} className="mt-10 flex flex-col gap-6" noValidate>
      <TextField id="lastName" name="lastName" label="Nom" autoComplete="family-name" value={lastName} onChange={setLastName} error={fe?.lastName} />
      <TextField id="firstName" name="firstName" label="Prénom" autoComplete="given-name" value={firstName} onChange={setFirstName} error={fe?.firstName} />
      <TextField id="email" name="email" type="email" label="Email" autoComplete="email" value={email} onChange={setEmail} error={fe?.email} />
      <TextField
        id="newPassword"
        name="newPassword"
        type="password"
        label="Mot de passe"
        autoComplete="new-password"
        placeholder="••••••••••••"
        required={false}
        value={newPassword}
        onChange={setNewPassword}
        hint="Laissez vide pour garder votre mot de passe. 8 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial (@$!%*?&)."
        error={fe?.newPassword}
      />
      {newPassword && (
        <TextField
          id="currentPassword"
          name="currentPassword"
          type="password"
          label="Mot de passe actuel"
          autoComplete="current-password"
          value={currentPassword}
          onChange={setCurrentPassword}
          error={fe?.currentPassword}
        />
      )}

      <div aria-live="polite">
        {state.success && <p className="text-status-done text-sm">{state.success}</p>}
        {state.error && <p className="text-status-todo text-sm">{state.error}</p>}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-dark h-[50px] w-[242px] rounded-[10px] text-sm text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : "Modifier les informations"}
      </button>
    </form>
  );
}
