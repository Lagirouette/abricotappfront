"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthFormState } from "../../app/actions/auth";

type Props = {
  title: string;
  submitLabel: string;
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  showForgotPassword?: boolean;
  footer: { text: string; linkLabel: string; href: string };
};

export default function AuthForm({
  title,
  submitLabel,
  action,
  showForgotPassword = false,
  footer,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="flex w-full max-w-[283px] flex-1 flex-col">
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="font-heading text-primary mb-8 text-center text-[2.5rem] font-bold">
          {title}
        </h1>

        <form action={formAction} className="flex flex-col gap-6" noValidate>
          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            defaultValue={state.email}
            error={state.fieldErrors?.email}
          />
          <Field
            id="password"
            label="Mot de passe"
            type="password"
            autoComplete={showForgotPassword ? "current-password" : "new-password"}
            error={state.fieldErrors?.password}
          />

          {state.error && !state.fieldErrors?.email && !state.fieldErrors?.password && (
            <p role="alert" className="text-status-todo text-center text-sm">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="bg-dark mx-auto mt-2 h-[50px] w-[248px] rounded-[10px] text-sm text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Chargement…" : submitLabel}
          </button>
        </form>

        {showForgotPassword && (
          <span className="text-primary mt-4 cursor-not-allowed text-center text-sm underline opacity-80">
            Mot de passe oublié?
          </span>
        )}
      </div>

      <p className="pb-14 text-center text-sm">
        {footer.text}{" "}
        <Link href={footer.href} className="text-primary underline">
          {footer.linkLabel}
        </Link>
      </p>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  ...input
}: {
  id: string;
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <input
        id={id}
        name={id}
        required
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="border-line focus:border-primary h-[53px] rounded-[4px] border bg-white px-4 text-sm outline-none aria-[invalid=true]:border-status-todo"
        {...input}
      />
      {error && (
        <p id={`${id}-error`} className="text-status-todo text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
