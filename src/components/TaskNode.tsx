"use client";
import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import type { TaskNode as TNode, TaskType } from "@/types/board";
import { Button } from "@/components/ui/button";
import { EditTaskDialog } from "@/components/EditTaskDialog";

const typeToBorder: Record<TaskType, string> = {
  code: "border-l-blue-600",
  art: "border-l-rose-600",
  audio: "border-l-green-600",
  design: "border-l-purple-600",
  other: "border-l-slate-500",
};

export const TaskNode = memo((props: NodeProps<TNode["data"]>) => {
  const { data, id } = props;
  const [open, setOpen] = useState(false);

  const onDoubleClick = useCallback(() => setOpen(true), []);

  return (
    <div
      onDoubleClick={onDoubleClick}
      className={`bg-white rounded-xl shadow-lg p-3 border border-slate-200 relative select-none ${typeToBorder[data.taskType]} border-l-4`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-sm sm:text-base" title={data.title}>
              {data.title}
            </h3>
            <span className="ml-1 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
              {data.difficulty}
            </span>
          </div>
          {data.description ? (
            <p className="mt-1 max-w-[220px] truncate text-xs text-slate-600">{data.description}</p>
          ) : null}
        </div>
        <Button
          aria-label="Edit task"
          size="sm"
          variant="secondary"
          onClick={() => setOpen(true)}
        >
          Edit
        </Button>
      </div>

      <Handle id="top" type="target" position={Position.Top} />
      <Handle id="bottom" type="source" position={Position.Bottom} />

      <EditTaskDialog open={open} onOpenChange={setOpen} nodeId={id} initial={data} />
    </div>
  );
});

TaskNode.displayName = "TaskNode";

