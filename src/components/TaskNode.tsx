"use client";
import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import type { TaskNode as TNode, TaskType } from "@/types/board";
import { Button } from "@/components/ui/button";
import { EditTaskDialog } from "@/components/EditTaskDialog";
import { useBoardStore } from "@/store/useBoardStore";

const typeToBg: Record<TaskType, string> = {
  "Код": "bg-blue-500",
  "Арт": "bg-rose-500",
  "Звук": "bg-emerald-500",
  "Полировка": "bg-purple-500",
  "Маркетинг": "bg-amber-400",
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

  return (
    <div
      onDoubleClick={onDoubleClick}
      className={`relative select-none rounded-xl shadow-lg border border-slate-200 p-5 w-96 sm:w-[28rem] ${typeToBg[data.taskType]} ${
        isCompleted ? "opacity-75 grayscale" : ""
      }`}
    >
      <div className="flex flex-col gap-2 text-white">
        <div className="flex items-center justify-between">
          <h3 className="truncate font-semibold text-base" title={data.title}>
            {data.title}
          </h3>
          <span className="rounded bg-white/20 px-2 py-0.5 text-xs capitalize">
            {data.difficulty}
          </span>
        </div>
        {data.description ? (
          <p className="text-sm/5 text-white/90 break-words whitespace-pre-wrap">{data.description}</p>
        ) : null}
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs font-medium text-white/90">{labelForType(data.taskType)}</span>
          <div className="flex gap-2">
            {!isCompleted && (
              <Button
                aria-label="Редактировать задачу"
                size="sm"
                variant="secondary"
                onClick={() => setOpen(true)}
              >
                Edit
              </Button>
            )}
            {!isCompleted ? (
              <Button
                aria-label="Отметить как выполнено"
                size="sm"
                variant="secondary"
                disabled={!canComplete}
                onClick={markDone}
              >
                Выполнено
              </Button>
            ) : (
              <Button
                aria-label="Отменить выполнение"
                size="sm"
                variant="secondary"
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

      <Handle id="top" type="target" position={Position.Top} />
      <Handle id="bottom" type="source" position={Position.Bottom} />

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
    case "Другое":
    default:
      return "🧩 Другое";
  }
}
