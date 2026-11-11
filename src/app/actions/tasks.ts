"use server";

import { ApiError, apiFetch } from "@/src/lib/api";
import { Task, TaskStatus } from "@/src/types/api";
import { refresh } from "next/cache";

export type TaskFormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"title" | "description" | "dueDate" | "assigneeIds", string>>;
};

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

function readTaskForm(formData: FormData) {
  const status = String(formData.get("status") ?? "TODO") as TaskStatus;
  return {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    dueDate: String(formData.get("dueDate") ?? ""), // format "YYYY-MM-DD"
    assigneeIds: formData.getAll("assigneeIds").map(String),
    status: STATUSES.includes(status) ? status : "TODO",
  };
}

function validate(data: ReturnType<typeof readTaskForm>): TaskFormState["fieldErrors"] {
  const errors: TaskFormState["fieldErrors"] = {};
  if (!data.title) errors.title = "Le titre est requis";
  if (!data.description) errors.description = "La description est requise";
  if (!data.dueDate) errors.dueDate = "L'échéance est requise";
  return errors;
}

function toFormState(error: unknown): TaskFormState {
  if (!(error instanceof ApiError)) throw error; // ex. redirection /logout
  const fieldErrors: TaskFormState["fieldErrors"] = {};
  for (const e of error.errors) {
    if (e.field === "title" || e.field === "description" || e.field === "dueDate") {
      fieldErrors[e.field] = e.message;
    }
  }
  return { error: error.message, fieldErrors };
}

export async function createTask(
  projectId: string,
  _prev: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const data = readTaskForm(formData);
  const fieldErrors = validate(data);
  if (Object.keys(fieldErrors ?? {}).length > 0) return { fieldErrors };

  try {
    const { task } = await apiFetch<{ task: Task }>(`/projects/${projectId}/tasks`, {
      method: "POST",
      body: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        assigneeIds: data.assigneeIds,
      },
    });
    if (data.status !== "TODO") {
      await apiFetch(`/projects/${projectId}/tasks/${task.id}`, {
        method: "PUT",
        body: { status: data.status },
      });
    }
  } catch (error) {
    return toFormState(error);
  }

  refresh();
  return { success: true };
}

export async function updateTask(
  projectId: string,
  taskId: string,
  _prev: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const data = readTaskForm(formData);
  const fieldErrors = validate(data);
  if (Object.keys(fieldErrors ?? {}).length > 0) return { fieldErrors };

  try {
    await apiFetch(`/projects/${projectId}/tasks/${taskId}`, { method: "PUT", body: data });
  } catch (error) {
    return toFormState(error);
  }

  refresh();
  return { success: true };
}

export async function deleteTask(projectId: string, taskId: string): Promise<{ error?: string }> {
  try {
    await apiFetch(`/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    throw error;
  }
  refresh();
  return {};
}

export type CommentFormState = { success?: boolean; error?: string };

export async function addComment(
  projectId: string,
  taskId: string,
  _prev: CommentFormState,
  formData: FormData
): Promise<CommentFormState> {
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return { error: "Le commentaire est vide" };

  try {
    await apiFetch(`/projects/${projectId}/tasks/${taskId}/comments`, {
      method: "POST",
      body: { content },
    });
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    throw error;
  }

  refresh();
  return { success: true };
}

export async function deleteComment(
  projectId: string,
  taskId: string,
  commentId: string
): Promise<{ error?: string }> {
  try {
    await apiFetch(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, {
      method: "DELETE",
    });
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    throw error;
  }
  refresh();
  return {};
}
