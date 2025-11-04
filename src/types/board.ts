export type TaskType =
  | "Код"
  | "Арт"
  | "Звук"
  | "Полировка"
  | "Маркетинг"
  | "Тестирование"
  | "Контент"
  | "Другое";

export type TaskData = {
  title: string;
  description?: string;
  difficulty: "Легкая" | "Средняя" | "Сложная";
  taskType: TaskType;
  completed?: boolean;
  // Чеклист подзадач: позволяет отмечать выполнение по пунктам.
  // Если чеклист не пустой, статус карточки выводится из него (все пункты done => completed=true).
  checklist?: ChecklistItem[];
  // Таймер активности задачи
  // activeStartTime - timestamp начала текущего периода активности (если задача активна сейчас)
  activeStartTime?: number;
  // accumulatedDuration - накопленное время активности в секундах (сохраняется при паузе)
  accumulatedDuration?: number;
  // completedDuration - финальное время выполнения в секундах (если задача завершена)
  completedDuration?: number;
};

export type TaskNode = {
  id: string;
  type: "taskNode";
  position: { x: number; y: number };
  data: TaskData;
};

export type DependencyEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: "bottom";
  targetHandle?: "top";
  type?: "smoothstep";
};

export type BoardState = {
  nodes: TaskNode[];
  edges: DependencyEdge[];
};

export type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};
