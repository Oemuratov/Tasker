"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BoardState, DependencyEdge, TaskData, TaskNode } from "@/types/board";
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
          nodes: get().nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...patch } } : n
          ),
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
