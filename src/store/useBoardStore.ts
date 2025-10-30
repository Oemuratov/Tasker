"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BoardState, DependencyEdge, TaskData, TaskNode, ChecklistItem } from "@/types/board";
import { STORAGE_KEY } from "@/lib/storage";

type Actions = {
  addNode: (data: TaskData, position?: { x: number; y: number }) => string;
  updateNode: (id: string, patch: Partial<TaskData>) => void;
  removeNode: (id: string) => void;
  setNodePosition: (id: string, pos: { x: number; y: number }) => void;
  addEdge: (edge: Omit<DependencyEdge, "id">) => void;
  removeEdge: (id: string) => void;
  setAll: (nodes: TaskNode[], edges: DependencyEdge[]) => void;
  setActiveMode: (v: boolean) => void;
  toggleActiveMode: () => void;
  // Чеклист
  addChecklistItem: (nodeId: string, text: string) => void;
  updateChecklistItem: (
    nodeId: string,
    itemId: string,
    patch: Partial<Pick<ChecklistItem, "text" | "done">>
  ) => void;
  removeChecklistItem: (nodeId: string, itemId: string) => void;
  reorderChecklist: (nodeId: string, fromIndex: number, toIndex: number) => void;
};

type Store = BoardState & Actions & {
  activeMode: boolean;
};

export const useBoardStore = create<Store>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      activeMode: false,

      addNode: (data, position) => {
        const id = crypto.randomUUID();
        const node: TaskNode = {
          id,
          type: "taskNode",
          position: position ?? { x: 0, y: 0 },
          data,
        };
        set({ nodes: [...get().nodes, node] });
        return id;
      },

      updateNode: (id, patch) => {
        set({
          nodes: get().nodes.map((n) => {
            if (n.id !== id) return n;
            const nextData: TaskData = { ...n.data, ...patch };
            // Если есть чеклист, и он не пустой — пересчитать completed
            const cl = nextData.checklist;
            if (Array.isArray(cl) && cl.length > 0) {
              nextData.completed = cl.every((i) => !!i.done);
            }
            return { ...n, data: nextData };
          }),
        });
      },

      removeNode: (id) => {
        const edges = get().edges.filter((e) => e.source !== id && e.target !== id);
        const nodes = get().nodes.filter((n) => n.id !== id);
        set({ nodes, edges });
      },

      setNodePosition: (id, pos) => {
        set({
          nodes: get().nodes.map((n) => (n.id === id ? { ...n, position: pos } : n)),
        });
      },

      addEdge: (edge) => {
        const id = crypto.randomUUID();
        const newEdge: DependencyEdge = { id, type: "smoothstep", ...edge };
        set({ edges: [...get().edges, newEdge] });
      },

      removeEdge: (id) => {
        set({ edges: get().edges.filter((e) => e.id !== id) });
      },

      setAll: (nodes, edges) => set({ nodes, edges }),

      setActiveMode: (v) => set({ activeMode: v }),
      toggleActiveMode: () => set({ activeMode: !get().activeMode }),

      // ---- Чеклист экшены ----
      addChecklistItem: (nodeId, text) => {
        set({
          nodes: get().nodes.map((n) => {
            if (n.id !== nodeId) return n;
            const next: ChecklistItem = { id: crypto.randomUUID(), text, done: false };
            const checklist = [...(n.data.checklist ?? []), next];
            const completed = checklist.length > 0 ? checklist.every((i) => i.done) : n.data.completed;
            return { ...n, data: { ...n.data, checklist, completed } };
          }),
        });
      },

      updateChecklistItem: (nodeId, itemId, patch) => {
        set({
          nodes: get().nodes.map((n) => {
            if (n.id !== nodeId) return n;
            const checklist = (n.data.checklist ?? []).map((it) =>
              it.id === itemId ? { ...it, ...patch } : it
            );
            const completed = checklist.length > 0 ? checklist.every((i) => i.done) : n.data.completed;
            return { ...n, data: { ...n.data, checklist, completed } };
          }),
        });
      },

      removeChecklistItem: (nodeId, itemId) => {
        set({
          nodes: get().nodes.map((n) => {
            if (n.id !== nodeId) return n;
            const checklist = (n.data.checklist ?? []).filter((it) => it.id !== itemId);
            const completed = checklist.length > 0 ? checklist.every((i) => i.done) : undefined;
            // Если чеклист опустел — не насильно меняем completed; оставляем как было
            return {
              ...n,
              data: {
                ...n.data,
                checklist: checklist.length > 0 ? checklist : undefined,
                completed: completed ?? n.data.completed,
              },
            };
          }),
        });
      },

      reorderChecklist: (nodeId, fromIndex, toIndex) => {
        set({
          nodes: get().nodes.map((n) => {
            if (n.id !== nodeId) return n;
            const list = [...(n.data.checklist ?? [])];
            if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length) return n;
            const [moved] = list.splice(fromIndex, 1);
            list.splice(toIndex, 0, moved);
            const completed = list.length > 0 ? list.every((i) => i.done) : n.data.completed;
            return { ...n, data: { ...n.data, checklist: list, completed } };
          }),
        });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
    }
  )
);

export const useNodes = () => useBoardStore((s) => s.nodes);
export const useEdges = () => useBoardStore((s) => s.edges);
export const useActiveMode = () => useBoardStore((s) => s.activeMode);
