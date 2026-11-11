import CreateProjectButton from "@/src/components/projects/CreateProjectButton";
import ProjectCard from "@/src/components/projects/ProjectCard";
import { getProjectsWithProgress } from "@/src/lib/projects";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Mes projets" };

export default function ProjectsPage() {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Mes projets</h1>
          <p className="mt-4 text-lg">Gérez vos projets</p>
        </div>
        <CreateProjectButton />
      </div>

      <Suspense fallback={<p className="text-muted mt-14">Chargement des projets…</p>}>
        <ProjectsGrid />
      </Suspense>
    </>
  );
}

async function ProjectsGrid() {
  const items = await getProjectsWithProgress();

  if (items.length === 0) {
    return (
      <p className="text-muted mt-14 text-center">
        Vous n&apos;avez encore aucun projet. Créez-en un pour commencer.
      </p>
    );
  }

  return (
    <ul className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map(({ project, doneCount, totalCount }) => (
        <li key={project.id}>
          <ProjectCard project={project} doneCount={doneCount} totalCount={totalCount} />
        </li>
      ))}
    </ul>
  );
}
