"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useBoardStore } from "@/store/useBoardStore";
import type { TaskData, TaskType } from "@/types/board";

export function EditTaskDialog({
  open,
  onOpenChange,
  nodeId,
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  nodeId: string;
  initial: TaskData;
}) {
  const updateNode = useBoardStore((s) => s.updateNode);
  const removeNode = useBoardStore((s) => s.removeNode);
  const [data, setData] = React.useState<TaskData>(initial);

  React.useEffect(() => setData(initial), [initial]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.title.trim()) return;
    updateNode(nodeId, {
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      difficulty: data.difficulty,
      taskType: data.taskType,
    });
    onOpenChange(false);
  };

  const onDelete = () => {
    removeNode(nodeId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={onSubmit}>
        <DialogHeader>Редактировать задачу</DialogHeader>
        <div className="grid gap-3">
          <label className="text-sm font-medium text-slate-700">
            Тип задачи
            <Select
              className="mt-1"
              value={data.taskType}
              onValueChange={(v) => setData((d) => ({ ...d, taskType: v as TaskType }))}
              options={[
                { value: "Код", label: "💻 Код" },
                { value: "Арт", label: "🎨 Арт" },
                { value: "Звук", label: "🔊 Звук" },
                { value: "Полировка", label: "✨ Полировка" },
                { value: "Маркетинг", label: "📣 Маркетинг" },
                { value: "Тестирование", label: "🧪 Тестирование" },
                { value: "Контент", label: "✍️ Контент" },
                { value: "Другое", label: "🧩 Другое" },
              ]}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Название
            <Input
              aria-label="Название"
              className="mt-1"
              required
              value={data.title}
              onChange={(e) => setData((d) => ({ ...d, title: e.target.value }))}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Описание
            <Textarea
              aria-label="Описание"
              className="mt-1"
              value={data.description}
              onChange={(e) => setData((d) => ({ ...d, description: e.target.value }))}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Сложность
            <Select
              className="mt-1"
              value={data.difficulty}
              onValueChange={(v) => setData((d) => ({ ...d, difficulty: v as TaskData["difficulty"] }))}
              options={[
                { value: "легко", label: "легко" },
                { value: "средне", label: "средне" },
                { value: "сложно", label: "сложно" },
              ]}
            />
          </label>
        </div>
        <DialogFooter>
          <Button type="button" variant="destructive" onClick={onDelete} aria-label="Удалить">
            Удалить
          </Button>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} aria-label="Отменить">
            Отмена
          </Button>
          <Button type="submit" aria-label="Сохранить">Сохранить</Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
