import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ApiError } from "@/src/lib/api";
import type { Project } from "@/src/types/api";
import CreateTaskButton from "@/src/components/tasks/CreateTaskButton";
import EditProjectButton from "@/src/components/projects/EditProjectButton";
import { getProject, getProjectPeople, getProjectTasks } from "@/src/lib/projects";
import { getCurrentUser } from "@/src/lib/user";
import { displayName, sortByUrgency } from "@/src/lib/format";
import Avatar from "@/src/components/ui/Avatar";
import ProjectTasks from "@/src/components/tasks/ProjectTasks";

export async function generateMetadata({ params }: PageProps<"/projects/[id]">): Promise<Metadata> {
  const { id } = await params;
  try {
    const project = await getProject(id);
    return { title: project.name };
  } catch {
    return { title: "Projet" };
  }
}

export default function ProjectPage({ params }: PageProps<"/projects/[id]">) {
  return (
    <Suspense fallback={<p className="text-muted">Chargement du projet…</p>}>
      <ProjectContent params={params} />
    </Suspense>
  );
}

async function ProjectContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let project: Project;
  try {
    project = await getProject(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) return <NoAccess />;
    throw error;
  }

  const [tasks, me] = await Promise.all([getProjectTasks(id), getCurrentUser()]);
  const people = getProjectPeople(project);
  const isAdmin = project.userRole === "ADMIN";
  const isOwner = project.ownerId === me.id;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <Link
            href="/projects"
            aria-label="Retour à la liste des projets"
            className="border-line bg-surface hover:bg-background flex size-[57px] shrink-0 items-center justify-center rounded-[10px] border text-lg"
          >
            ←
          </Link>
          <div>
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="font-heading text-2xl font-semibold">{project.name}</h1>
              {isAdmin && <EditProjectButton project={project} canDelete={isOwner} />}
            </div>
            {project.description && <p className="mt-2 text-lg">{project.description}</p>}
          </div>
        </div>
        <CreateTaskButton projectId={project.id} people={people} />
      </div>

      <section
        aria-label="Contributeurs"
        className="bg-line/60 mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[10px] px-6 py-5 sm:px-12"
      >
        <p>
          <span className="font-heading font-semibold">Contributeurs</span>{" "}
          <span className="text-muted ml-2">
            {people.length} personne{people.length > 1 ? "s" : ""}
          </span>
        </p>
        <ul className="flex flex-wrap items-center gap-2 text-xs">
          {people.map((user) => {
            const owner = user.id === project.ownerId;
            return (
              <li key={user.id} className="flex items-center gap-1">
                <Avatar user={user} tone={owner ? "owner" : "default"} />
                <span
                  className={`rounded-full px-3 py-1 ${owner ? "bg-primary-light text-primary" : "bg-line"}`}
                >
                  {owner ? "Propriétaire" : displayName(user)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <ProjectTasks
        projectId={project.id}
        tasks={sortByUrgency(tasks)}
        people={people}
        currentUserId={me.id}
      />
    </>
  );
}

function NoAccess() {
  return (
    <div className="py-20 text-center">
      <h1 className="font-heading text-2xl font-semibold">Accès refusé</h1>
      <p className="text-muted mt-4">Vous n&apos;êtes ni propriétaire ni contributeur de ce projet.</p>
      <Link href="/projects" className="text-primary mt-6 inline-block underline">
        Retour à mes projets
      </Link>
    </div>
  );
}
