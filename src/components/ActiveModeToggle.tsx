"use client";
import { Button } from "@/components/ui/button";
import { useBoardStore } from "@/store/useBoardStore";

export function ActiveModeToggle() {
  const active = useBoardStore((s) => s.activeMode);
  const toggle = useBoardStore((s) => s.toggleActiveMode);
  return (
    <Button
      aria-label={active ? "Выйти из режима активных задач" : "Показать активные задачи"}
      className={`fixed bottom-6 right-40 shadow-lg h-10 w-10 p-0 rounded-full border ${
        active
          ? "!bg-green-500 hover:!bg-green-600 !text-white border-green-600"
          : "!bg-white hover:!bg-slate-50 !text-slate-800 border-slate-300"
      }`}
      onClick={toggle}
      title={active ? "Обычный режим" : "Режим активных задач"}
    >
      <span aria-hidden className="text-sm leading-none">
        🔮
      </span>
    </Button>
  );
}
