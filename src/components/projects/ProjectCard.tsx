import { Project, User } from "@/src/types/api";
import Link from "next/link";
import Avatar from "../ui/Avatar";
import { TeamIcon } from "../icons";

type Props = {
  project: Project;
  doneCount: number;
  totalCount: number;
};

export function getTeam(project: Project): { owner: User; others: User[] } {
  const others = project.members
    .map((m) => m.user)
    .filter((u) => u.id !== project.owner.id);
  return { owner: project.owner, others };
}

export default function ProjectCard({ project, doneCount, totalCount }: Props) {
  const percent = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const { owner, others } = getTeam(project);

  return (
    <article className="border-line bg-surface relative flex h-full flex-col rounded-[10px] border px-8 py-7 transition hover:shadow-md">
      <h2 className="font-heading text-lg font-semibold">
        <Link
          href={`/projects/${project.id}`}
          className="after:absolute after:inset-0 after:rounded-[10px] focus-visible:outline-none"
        >
          {project.name}
        </Link>
      </h2>
      {project.description && (
        <p className="text-muted mt-2 line-clamp-2 text-sm">{project.description}</p>
      )}

      <div className="mt-8 mb-10">
        <div className="text-muted flex justify-between text-xs">
          <span id={`progress-${project.id}`}>Progression</span>
          <span className="text-dark">{percent}%</span>
        </div>
        <div
          role="progressbar"
          aria-labelledby={`progress-${project.id}`}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="bg-line mt-2 h-[7px] overflow-hidden rounded-full"
        >
          <div className="bg-primary h-full rounded-full" style={{ width: `${percent}%` }} />
        </div>
        <p className="text-muted mt-2 text-[10px]">
          {doneCount}/{totalCount} tâches terminées
        </p>
      </div>

      <div className="mt-auto">
        <p className="text-muted flex items-center gap-2 text-[10px]">
          <TeamIcon /> Équipe ({others.length + 1})
        </p>
        <div className="mt-3 flex items-center">
          <Avatar user={owner} tone="owner" />
          <span className="bg-primary-light text-primary ml-1 rounded-full px-4 py-1 text-xs">
            Propriétaire
          </span>
          <span className="ml-2 flex -space-x-1.5">
            {others.slice(0, 4).map((u) => (
              <Avatar key={u.id} user={u} />
            ))}
            {others.length > 4 && (
              <span className="bg-line border-surface inline-flex size-[27px] items-center justify-center rounded-full border-2 text-[10px]">
                +{others.length - 4}
              </span>
            )}
          </span>
        </div>
      </div>
    </article>
  );
}
