"use client";
import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import type { TaskNode as TNode, TaskType } from "@/types/board";
import { Button } from "@/components/ui/button";
import { EditTaskDialog } from "@/components/EditTaskDialog";
import { useBoardStore } from "@/store/useBoardStore";

// Accent colors for task types (border + button color). Use ! to ensure override.
type Accent = { border: string; btn: string; ring: string };
const typeToAccent: Record<TaskType, Accent> = {
  "Код": { border: "border-blue-500", btn: "!bg-blue-500 hover:!bg-blue-600 !text-white", ring: "focus-visible:!ring-blue-500" },
  "Арт": { border: "border-rose-500", btn: "!bg-rose-500 hover:!bg-rose-600 !text-white", ring: "focus-visible:!ring-rose-500" },
  "Звук": { border: "border-emerald-500", btn: "!bg-emerald-500 hover:!bg-emerald-600 !text-white", ring: "focus-visible:!ring-emerald-500" },
  "Полировка": { border: "border-purple-500", btn: "!bg-purple-500 hover:!bg-purple-600 !text-white", ring: "focus-visible:!ring-purple-500" },
  "Маркетинг": { border: "border-amber-400", btn: "!bg-amber-500 hover:!bg-amber-600 !text-white", ring: "focus-visible:!ring-amber-500" },
  "Тестирование": { border: "border-cyan-500", btn: "!bg-cyan-500 hover:!bg-cyan-600 !text-white", ring: "focus-visible:!ring-cyan-500" },
  "Контент": { border: "border-orange-400", btn: "!bg-orange-500 hover:!bg-orange-600 !text-white", ring: "focus-visible:!ring-orange-500" },
  "Другое": { border: "border-slate-400", btn: "!bg-slate-500 hover:!bg-slate-600 !text-white", ring: "focus-visible:!ring-slate-500" },
};

const typeToBg: Record<TaskType, string> = {
  "Код": "bg-blue-500",
  "Арт": "bg-rose-500",
  "Звук": "bg-emerald-500",
  "Полировка": "bg-purple-500",
  "Маркетинг": "bg-amber-400",
  "Тестирование": "bg-cyan-500",
  "Контент": "bg-orange-400",
  "Другое": "bg-slate-400",
};

export const TaskNode = memo((props: NodeProps<TNode["data"]>) => {
  const { data, id } = props;
  const [open, setOpen] = useState(false);
  const edges = useBoardStore((s) => s.edges);
  const nodes = useBoardStore((s) => s.nodes);
  const updateNode = useBoardStore((s) => s.updateNode);

  const onDoubleClick = useCallback(() => setOpen(true), []);

  const incoming = edges.filter((e) => e.target === id);
  const allDepsDone = incoming.every((e) => {
    const dep = nodes.find((n) => n.id === e.source);
    return !!dep?.data.completed;
  });
  const isCompleted = !!data.completed;
  const canComplete = !isCompleted && (incoming.length === 0 || allDepsDone);

  const markDone = () => {
    if (!canComplete) return;
    updateNode(id, { completed: true });
  };
  const markUndone = () => {
    if (!isCompleted) return;
    updateNode(id, { completed: false });
  };

  const accent = isCompleted
    ? { border: "border-slate-400", btn: "bg-slate-400 hover:bg-slate-500 text-white", ring: "focus-visible:ring-slate-400" }
    : typeToAccent[data.taskType as TaskType];

  // Active tasks highlighting
  const activeMode = useBoardStore((s) => s.activeMode);
  const modeClass = activeMode ? (canComplete ? "ring-4 ring-green-500/60 shadow-xl" : "opacity-50 grayscale") : "";

  return (
    <div
      onDoubleClick={onDoubleClick}
      className={`relative select-none rounded-xl shadow-lg bg-white text-slate-900 p-5 w-96 sm:w-[28rem] border-8 ${accent.border} ${modeClass}`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-base leading-5 break-words whitespace-normal pr-2 flex-1 min-w-0" title={data.title}>
            {data.title}
          </h3>
          <span className={`rounded px-2 py-0.5 text-xs capitalize ${badgeForDifficulty(data.difficulty)}`}>
            {data.difficulty}
          </span>
        </div>
        {data.description ? (
          <p className="text-sm/5 text-slate-700 break-words whitespace-pre-wrap">{data.description}</p>
        ) : null}
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">{labelForType(data.taskType)}</span>
          <div className="flex gap-2">
            {!isCompleted && (
              <Button
                aria-label="Редактировать задачу"
                size="sm"
                variant="secondary"
                className={`${accent.btn} ${accent.ring}`}
                onClick={() => setOpen(true)}
              >
                Правка
              </Button>
            )}
            {!isCompleted ? (
              <Button
                aria-label="Отметить как выполнено"
                size="sm"
                variant="secondary"
                disabled={!canComplete}
                className={`${accent.btn} ${accent.ring}`}
                onClick={markDone}
              >
                ✅Выполнено
              </Button>
            ) : (
              <Button
                aria-label="Отменить выполнение"
                size="sm"
                variant="secondary"
                className={`${accent.btn} ${accent.ring}`}
                onClick={markUndone}
              >
                Отмена
              </Button>
            )}
          </div>
        </div>
      </div>

      {isCompleted ? (
        <div className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-green-600 shadow">
          ✓
        </div>
      ) : null}

      <Handle id="top" type="target" position={Position.Top} style={{ width: 9, height: 9 }} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={{ width: 9, height: 9 }} />

      <EditTaskDialog open={open} onOpenChange={setOpen} nodeId={id} initial={data} />
    </div>
  );
});

TaskNode.displayName = "TaskNode";

function labelForType(t: TaskType): string {
  switch (t) {
    case "Код":
      return "💻 Код";
    case "Арт":
      return "🎨 Арт";
    case "Звук":
      return "🔊 Звук";
    case "Полировка":
      return "✨ Полировка";
    case "Маркетинг":
      return "📣 Маркетинг";
    case "Тестирование":
      return "🧪 Тестирование";
    case "Контент":
      return "✍️ Контент";
    case "Другое":
    default:
      return "🧩 Другое";
  }
}

function badgeForDifficulty(d: string): string {
  const s = (d || "").toString().toLowerCase();
  if (s.includes("легк")) return "bg-green-100 text-green-700"; // Легкая / легко
  if (s.includes("слож")) return "bg-red-100 text-red-700"; // Сложная / сложно
  return "bg-amber-100 text-amber-800"; // Средняя / средне (по умолчанию)
}
