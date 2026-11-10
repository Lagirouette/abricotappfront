"use server";

import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "../../lib/api";
import { createSession, deleteSession } from "../../lib/session";
import type { AuthPayload } from "../../types/api";

export type AuthFormState = {
  error?: string;
  fieldErrors?: Partial<Record<"email" | "password", string>>;
  email?: string;
};

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

function toFormState(error: unknown, email: string): AuthFormState {
  if (error instanceof ApiError) {
    const fieldErrors: AuthFormState["fieldErrors"] = {};
    for (const e of error.errors) {
      if (e.field === "email" || e.field === "password") {
        fieldErrors[e.field] = e.message;
      }
    }
    return { error: error.message, fieldErrors, email };
  }
  return { error: "Une erreur inattendue est survenue", email };
}

export async function login(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const { email, password } = readCredentials(formData);

  if (!email || !password) {
    return { error: "Email et mot de passe requis", email };
  }

  try {
    const { token } = await apiFetch<AuthPayload>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    await createSession(token);
  } catch (error) {
    return toFormState(error, email);
  }

  // redirect() doit être appelé hors du try/catch
  redirect("/dashboard");
}

export async function register(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const { email, password } = readCredentials(formData);

  if (!email || !password) {
    return { error: "Email et mot de passe requis", email };
  }

  try {
    const { token } = await apiFetch<AuthPayload>("/auth/register", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    await createSession(token);
  } catch (error) {
    return toFormState(error, email);
  }

  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
