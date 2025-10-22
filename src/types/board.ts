export type TaskType = "Код" | "Арт" | "Звук" | "Полировка" | "Маркетинг" | "Другое";

export type TaskData = {
  title: string;
  description?: string;
  difficulty: "Легкая" | "Средняя" | "Сложная";
  taskType: TaskType;
  completed?: boolean;
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
