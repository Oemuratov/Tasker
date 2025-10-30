"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useBoardStore } from "@/store/useBoardStore";
import type { TaskData, TaskType, ChecklistItem } from "@/types/board";
import { useViewport } from "reactflow";
import { centerPosition } from "@/lib/graph";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
 

const defaultData: TaskData = {
  title: "",
  description: "",
  difficulty: "Средняя",
  taskType: "Другое",
};

export function CreateTaskDialog() {
  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState<TaskData>(defaultData);
  const [checklist, setChecklist] = React.useState<ChecklistItem[]>([]);
  const [newItem, setNewItem] = React.useState("");
  const addNode = useBoardStore((s) => s.addNode);
  const viewport = useViewport();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.title.trim()) return;
    const pos = centerPosition(viewport);
    const cl = checklist.map((i) => ({ ...i, text: i.text.trim() })).filter((i) => i.text.length > 0);
    const completed = cl.length > 0 ? cl.every((i) => i.done) : undefined;
    addNode({
      ...data,
      description: data.description?.trim() || undefined,
      checklist: cl.length ? cl : undefined,
      completed,
    }, pos);
    setOpen(false);
    setData(defaultData);
    setChecklist([]);
    setNewItem("");
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
                  { value: "Легкая", label: "Легкая" },
                  { value: "Средняя", label: "Средняя" },
                  { value: "Сложная", label: "Сложная" }, 
                ]}
              />
            </label>
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-700">Чеклист</div>
              <div className="flex gap-2">
                <Input
                  aria-label="Новый пункт"
                  placeholder="Добавить пункт"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    const text = newItem.trim();
                    if (!text) return;
                    setChecklist((l) => [...l, { id: crypto.randomUUID(), text, done: false }]);
                    setNewItem("");
                  }}
                >
                  Добавить
                </Button>
              </div>
              {checklist.length > 0 ? (
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={(e: DragEndEvent) => {
                    const { active, over } = e;
                    if (!over || active.id === over.id) return;
                    const oldIndex = checklist.findIndex((i) => i.id === active.id);
                    const newIndex = checklist.findIndex((i) => i.id === over.id);
                    setChecklist((l) => arrayMove(l, oldIndex, newIndex));
                  }}
                >
                  <SortableContext items={checklist.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    <ul className="max-h-48 overflow-auto space-y-2">
                      {checklist.map((item) => (
                        <SortableItem key={item.id} id={item.id}>
                          <div className="flex items-center gap-2">
                            <input
                              aria-label="Готово"
                              type="checkbox"
                              className="h-5 w-5 accent-green-600"
                              checked={item.done}
                              onChange={(e) =>
                                setChecklist((l) => l.map((it) => (it.id === item.id ? { ...it, done: e.target.checked } : it)))
                              }
                            />
                            <Input
                              aria-label="Текст пункта"
                              value={item.text}
                              onChange={(e) =>
                                setChecklist((l) => l.map((it) => (it.id === item.id ? { ...it, text: e.target.value } : it)))
                              }
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => setChecklist((l) => l.filter((it) => it.id !== item.id))}
                            >
                              Удалить
                            </Button>
                          </div>
                        </SortableItem>
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              ) : null}
            </div>
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

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </li>
  );
}
