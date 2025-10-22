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
  difficulty: 3,
  taskType: "other",
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
                aria-label="Тип задачи"
                className="mt-1"
                value={data.taskType}
                onChange={(e) => setData((d) => ({ ...d, taskType: e.target.value as TaskType }))}
              >
                <option value="code">code</option>
                <option value="art">art</option>
                <option value="audio">audio</option>
                <option value="design">design</option>
                <option value="other">other</option>
              </Select>
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
                aria-label="Сложность"
                className="mt-1"
                value={String(data.difficulty)}
                onChange={(e) => setData((d) => ({ ...d, difficulty: Number(e.target.value) as TaskData["difficulty"] }))}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </Select>
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

