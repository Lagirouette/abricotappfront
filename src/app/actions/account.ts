"use server";

import { ApiError, apiFetch } from "@/src/lib/api";
import { User } from "@/src/types/api";
import { refresh } from "next/cache";

type Field = "lastName" | "firstName" | "email" | "currentPassword" | "newPassword";

export type AccountFormState = {
  success?: string;
  error?: string;
  fieldErrors?: Partial<Record<Field, string>>;
};

export async function updateAccount(
  _prev: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  const fieldErrors: AccountFormState["fieldErrors"] = {};
  if (!firstName) fieldErrors.firstName = "Le prénom est requis";
  if (!lastName) fieldErrors.lastName = "Le nom est requis";
  if (!email) fieldErrors.email = "L'email est requis";
  if (newPassword && !currentPassword) {
    fieldErrors.currentPassword = "Saisissez votre mot de passe actuel pour le modifier";
  }
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  try {
    await apiFetch<{ user: User }>("/auth/profile", {
      method: "PUT",
      body: { name: `${firstName} ${lastName}`, email },
    });
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    const errors: AccountFormState["fieldErrors"] = {};
    for (const e of error.errors) {
      if (e.field === "email") errors.email = e.message;
      if (e.field === "name") errors.lastName = e.message;
    }
    return { error: error.message, fieldErrors: errors };
  }

  if (newPassword) {
    try {
      await apiFetch("/auth/password", {
        method: "PUT",
        body: { currentPassword, newPassword },
        logoutOnUnauthorized: false,
      });
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      refresh();
      const errors: AccountFormState["fieldErrors"] = {};
      if (error.status === 401) errors.currentPassword = error.message;
      for (const e of error.errors) {
        if (e.field === "newPassword") errors.newPassword = e.message;
        if (e.field === "currentPassword") errors.currentPassword = e.message;
      }
      return {
        error: "Vos informations ont été enregistrées, mais pas le nouveau mot de passe.",
        fieldErrors: errors,
      };
    }
  }

  refresh();
  return {
    success: newPassword
      ? "Vos informations et votre mot de passe ont été mis à jour."
      : "Vos informations ont été mises à jour.",
  };
}
