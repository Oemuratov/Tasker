export type TaskType = "code" | "art" | "audio" | "design" | "other";

export type TaskData = {
  title: string;
  description?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  taskType: TaskType;
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

