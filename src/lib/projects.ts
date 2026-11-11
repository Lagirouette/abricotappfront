import { cache } from "react";
import { Project, Task, User } from "../types/api";
import { apiFetch } from "./api";

export const getProject = cache(async (id: string): Promise<Project> => {
  const { project } = await apiFetch<{ project: Project }>(`/projects/${id}`);
  return project;
});

export async function getProjectTasks(id: string): Promise<Task[]> {
  const { tasks } = await apiFetch<{ tasks: Task[] }>(`/projects/${id}/tasks`);
  return tasks;
}

export function getProjectPeople(project: Project): User[] {
  const others = project.members.map((m) => m.user).filter((u) => u.id !== project.owner.id);
  return [project.owner, ...others];
}

export type ProjectWithProgress = {
  project: Project;
  doneCount: number;
  totalCount: number;
};

export async function getProjectsWithProgress(): Promise<ProjectWithProgress[]> {
  const { projects } = await apiFetch<{ projects: Project[] }>("/projects");

  return Promise.all(
    projects.map(async (project) => {
      const { tasks } = await apiFetch<{ tasks: Task[] }>(`/projects/${project.id}/tasks`);
      const counted = tasks.filter((t) => t.status !== "CANCELLED");
      return {
        project,
        doneCount: counted.filter((t) => t.status === "DONE").length,
        totalCount: counted.length,
      };
    })
  );
}
