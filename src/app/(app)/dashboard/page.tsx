import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { apiFetch } from "../../../lib/api";
import { getCurrentUser } from "../../../lib/user";
import { displayName, sortByUrgency, sortProjectsByUrgency } from "../../../lib/format";
import type { Project, Task } from "../../../types/api";
import DashboardViews from "../../../components/dashboard/DashboardViews";
import CreateProjectButton from "@/src/components/projects/CreateProjectButton";

export const metadata: Metadata = { title: "Tableau de bord" };

export default function DashboardPage() {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Tableau de bord</h1>
          <Suspense fallback={<p className="mt-4 h-6" />}>
            <Greeting />
          </Suspense>
        </div>
        <CreateProjectButton />
      </div>

      <Suspense fallback={<p className="text-muted mt-14">Chargement des tâches…</p>}>
        <AssignedTasks />
      </Suspense>
    </>
  );
}

async function Greeting() {
  const user = await getCurrentUser();
  return (
    <p className="mt-4 text-lg">
      Bonjour {displayName(user)}, voici un aperçu de vos projets et tâches
    </p>
  );
}

async function AssignedTasks() {
  const [{ tasks }, { projects }] = await Promise.all([
    apiFetch<{ tasks: Task[] }>("/dashboard/assigned-tasks"),
    apiFetch<{ projects: Project[] }>("/dashboard/projects-with-tasks"),
  ]);
  return (
    <DashboardViews
      tasks={sortByUrgency(tasks)}
      projects={sortProjectsByUrgency(projects)}
    />
  );
}

