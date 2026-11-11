import { Project, Task } from "../types/api";
import { apiFetch } from "./api";

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
