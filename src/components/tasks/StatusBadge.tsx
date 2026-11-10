import type { TaskStatus } from "../../types/api";
import { STATUS_LABELS } from "../../lib/format";

const STYLES: Record<TaskStatus, string> = {
  TODO: "bg-status-todo-bg text-status-todo",
  IN_PROGRESS: "bg-status-progress-bg text-status-progress",
  DONE: "bg-status-done-bg text-status-done",
  CANCELLED: "bg-line text-muted",
};

export default function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex h-[25px] shrink-0 items-center rounded-full px-4 text-xs whitespace-nowrap ${STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
