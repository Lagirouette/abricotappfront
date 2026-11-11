"use server";

import { ApiError, apiFetch } from "@/src/lib/api";
import { Project } from "@/src/types/api";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";

export type ProjectFormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"name" | "description" | "contributors", string>>;
};

export async function createProject(
  _prev: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const contributors = formData.getAll("contributors").map(String).filter(Boolean);

  const fieldErrors: ProjectFormState["fieldErrors"] = {};
  if (!name) fieldErrors.name = "Le titre est requis";
  if (!description) fieldErrors.description = "La description est requise";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  try {
    await apiFetch<{ project: Project }>("/projects", {
      method: "POST",
      body: { name, description, contributors },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      const apiFieldErrors: ProjectFormState["fieldErrors"] = {};
      for (const e of error.errors) {
        if (e.field === "name" || e.field === "description") apiFieldErrors[e.field] = e.message;
        else if (e.field.startsWith("contributors")) apiFieldErrors.contributors = e.message;
      }
      return { error: error.message, fieldErrors: apiFieldErrors };
    }
    throw error;
  }

  refresh();
  return { success: true };
}

export async function updateProject(
  projectId: string,
  _prev: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const wanted = new Set(
    formData.getAll("contributors").map((e) => String(e).toLowerCase())
  );

  const fieldErrors: ProjectFormState["fieldErrors"] = {};
  if (!name) fieldErrors.name = "Le titre est requis";
  if (!description) fieldErrors.description = "La description est requise";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  try {
    await apiFetch(`/projects/${projectId}`, { method: "PUT", body: { name, description } });

    const { project } = await apiFetch<{ project: Project }>(`/projects/${projectId}`);
    const current = project.members.filter((m) => m.user.id !== project.ownerId);
    const currentEmails = new Set(current.map((m) => m.user.email.toLowerCase()));

    const toAdd = [...wanted].filter((email) => !currentEmails.has(email));
    const toRemove = current.filter((m) => !wanted.has(m.user.email.toLowerCase()));

    for (const email of toAdd) {
      await apiFetch(`/projects/${projectId}/contributors`, {
        method: "POST",
        body: { email, role: "CONTRIBUTOR" },
      });
    }
    for (const member of toRemove) {
      await apiFetch(`/projects/${projectId}/contributors/${member.user.id}`, {
        method: "DELETE",
      });
    }
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    throw error;
  }

  refresh();
  return { success: true };
}

export async function deleteProject(projectId: string): Promise<{ error?: string }> {
  try {
    await apiFetch(`/projects/${projectId}`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    throw error;
  }
  redirect("/projects");
}