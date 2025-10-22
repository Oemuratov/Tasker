"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useBoardStore } from "@/store/useBoardStore";
import type { TaskData, TaskType } from "@/types/board";
import { useViewport } from "reactflow";
import { centerPosition } from "@/lib/graph";

const defaultData: TaskData = {
  title: "",
  description: "",
  difficulty: "средне",
  taskType: "Другое",
};

export function CreateTaskDialog() {
  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState<TaskData>(defaultData);
  const addNode = useBoardStore((s) => s.addNode);
  const viewport = useViewport();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.title.trim()) return;
    const pos = centerPosition(viewport);
    addNode({ ...data, description: data.description?.trim() || undefined }, pos);
    setOpen(false);
    setData(defaultData);
  };

  return (
    <>
      <Button
        aria-label="Создать задачу"
        className="fixed bottom-6 right-6 shadow-lg"
        onClick={() => setOpen(true)}
      >
        Создать задачу
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={onSubmit}>
          <DialogHeader>Новая задача</DialogHeader>
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
            <Button type="button" variant="secondary" onClick={() => setOpen(false)} aria-label="Отменить">
              Отмена
            </Button>
            <Button type="submit" aria-label="Создать">Создать</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
