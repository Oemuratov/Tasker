"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useBoardStore } from "@/store/useBoardStore";
import type { TaskData, TaskType } from "@/types/board";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  const addChecklistItem = useBoardStore((s) => s.addChecklistItem);
  const updateChecklistItem = useBoardStore((s) => s.updateChecklistItem);
  const removeChecklistItem = useBoardStore((s) => s.removeChecklistItem);
  const reorderChecklist = useBoardStore((s) => s.reorderChecklist);
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
                { value: "Легкая", label: "Легкая" },
                { value: "Средняя", label: "Средняя" },
                { value: "Сложная", label: "Сложная" },
              ]}
            />
          </label>
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700">Чеклист</div>
            <AddItemBar onAdd={(text) => addChecklistItem(nodeId, text)} />
            {Array.isArray(data.checklist) && data.checklist.length > 0 ? (
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={(e: DragEndEvent) => {
                  const { active, over } = e;
                  if (!over || active.id === over.id) return;
                  const list = data.checklist ?? [];
                  const oldIndex = list.findIndex((i) => i.id === active.id);
                  const newIndex = list.findIndex((i) => i.id === over.id);
                  if (oldIndex >= 0 && newIndex >= 0) reorderChecklist(nodeId, oldIndex, newIndex);
                }}
              >
                <SortableContext items={(data.checklist ?? []).map((i) => i.id)} strategy={verticalListSortingStrategy}>
                  <ul className="max-h-56 overflow-auto space-y-2">
                    {(data.checklist ?? []).map((item) => (
                      <SortableItem key={item.id} id={item.id}>
                        <div className="flex items-center gap-2">
                          <input
                            aria-label="Готово"
                            type="checkbox"
                            className="h-5 w-5 accent-green-600"
                            checked={!!item.done}
                            onChange={(e) => updateChecklistItem(nodeId, item.id, { done: e.target.checked })}
                          />
                          <Input
                            aria-label="Текст пункта"
                            value={item.text}
                            onChange={(e) => updateChecklistItem(nodeId, item.id, { text: e.target.value })}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeChecklistItem(nodeId, item.id)}
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

function AddItemBar({ onAdd }: { onAdd: (text: string) => void }) {
  const [v, setV] = React.useState("");
  return (
    <div className="flex gap-2">
      <Input
        aria-label="Новый пункт"
        placeholder="Добавить пункт"
        value={v}
        onChange={(e) => setV(e.target.value)}
      />
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          const t = v.trim();
          if (!t) return;
          onAdd(t);
          setV("");
        }}
      >
        Добавить
      </Button>
    </div>
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
