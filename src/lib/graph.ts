import type { Connection } from "reactflow";
import type { DependencyEdge } from "@/types/board";

export function isValidConnection(
  conn: Connection,
  edges: DependencyEdge[]
): boolean {
  const { source, target, sourceHandle, targetHandle } = conn;
  if (!source || !target) return false;
  if (source === target) return false;
  if (sourceHandle !== "bottom") return false;
  if (targetHandle !== "top") return false;
  const duplicate = edges.some(
    (e) => e.source === source && e.target === target && e.sourceHandle === "bottom" && e.targetHandle === "top"
  );
  if (duplicate) return false;
  return true;
}

export type Viewport = { x: number; y: number; zoom: number };

export function centerPosition(viewport: Viewport): { x: number; y: number } {
  const width = typeof window !== "undefined" ? window.innerWidth : 0;
  const height = typeof window !== "undefined" ? window.innerHeight : 0;
  const x = (-viewport.x + width / 2) / viewport.zoom;
  const y = (-viewport.y + height / 2) / viewport.zoom;
  return { x, y };
}

