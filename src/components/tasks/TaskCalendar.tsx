"use client";

import { useMemo, useState } from "react";
import type { Task, TaskStatus } from "@/src/types/api";

type Props = {
  tasks: Task[];
  onSelect: (task: Task) => void;
};

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const CHIP_STYLES: Record<TaskStatus, string> = {
  TODO: "bg-status-todo-bg text-status-todo",
  IN_PROGRESS: "bg-status-progress-bg text-status-progress",
  DONE: "bg-status-done-bg text-status-done",
  CANCELLED: "bg-line text-muted",
};

/** Clé "YYYY-MM-DD" en UTC (les échéances du backend sont à minuit UTC) */
function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function initialMonth(tasks: Task[]): Date {
  const now = new Date();
  const thisMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  const dates = tasks.filter((t) => t.dueDate).map((t) => new Date(t.dueDate!));
  if (dates.length === 0) return thisMonth;
  const sameMonth = (d: Date) =>
    d.getUTCFullYear() === thisMonth.getUTCFullYear() && d.getUTCMonth() === thisMonth.getUTCMonth();
  if (dates.some(sameMonth)) return thisMonth;
  const upcoming = dates.filter((d) => d > now).sort((a, b) => +a - +b)[0];
  const target = upcoming ?? dates.sort((a, b) => +b - +a)[0];
  return new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), 1));
}

export default function TaskCalendar({ tasks, onSelect }: Props) {
  const [month, setMonth] = useState(() => initialMonth(tasks));

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const key = task.dueDate.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), task]);
    }
    return map;
  }, [tasks]);

  const year = month.getUTCFullYear();
  const m = month.getUTCMonth();
  const offset = (new Date(Date.UTC(year, m, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, m + 1, 0)).getUTCDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(Date.UTC(year, m, i + 1))),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayKey = dayKey(new Date());
  const label = month.toLocaleDateString("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });
  const noTaskInMonth = cells.every((d) => !d || !tasksByDay.has(dayKey(d)));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(new Date(Date.UTC(year, m - 1, 1)))}
          className="border-line hover:bg-background rounded-[8px] border px-3 py-1.5 text-sm"
          aria-label="Mois précédent"
        >
          ‹
        </button>
        <h3 className="font-heading font-semibold first-letter:uppercase" aria-live="polite">
          {label}
        </h3>
        <button
          type="button"
          onClick={() => setMonth(new Date(Date.UTC(year, m + 1, 1)))}
          className="border-line hover:bg-background rounded-[8px] border px-3 py-1.5 text-sm"
          aria-label="Mois suivant"
        >
          ›
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] table-fixed border-collapse text-xs">
          <thead>
            <tr>
              {WEEKDAYS.map((d) => (
                <th key={d} scope="col" className="text-muted pb-2 font-normal">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: cells.length / 7 }, (_, week) => (
              <tr key={week}>
                {cells.slice(week * 7, week * 7 + 7).map((date, i) => {
                  if (!date) return <td key={i} className="border-line bg-background h-24 border" />;
                  const key = dayKey(date);
                  const dayTasks = tasksByDay.get(key) ?? [];
                  return (
                    <td key={i} className="border-line h-24 border p-1 align-top">
                      <span
                        className={`mb-1 inline-flex size-6 items-center justify-center rounded-full ${
                          key === todayKey ? "bg-primary text-white" : ""
                        }`}
                      >
                        {date.getUTCDate()}
                      </span>
                      <ul className="flex flex-col gap-1">
                        {dayTasks.map((task) => (
                          <li key={task.id}>
                            <button
                              type="button"
                              onClick={() => onSelect(task)}
                              title={task.title}
                              className={`w-full truncate rounded px-1.5 py-0.5 text-left ${CHIP_STYLES[task.status]}`}
                            >
                              {task.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {noTaskInMonth && <p className="text-muted mt-4 text-center text-sm">Aucune échéance ce mois-ci.</p>}
    </div>
  );
}
