"use client";
import * as React from "react";
import { useBoardStore } from "@/store/useBoardStore";
import type { BoardState } from "@/types/board";

function hashState(state: BoardState) {
  try {
    return JSON.stringify({ n: state.nodes, e: state.edges });
  } catch {
    return "";
  }
}

const SYNC_INTERVAL_MS = 5000;
const POST_DEBOUNCE_MS = 500;

export function SyncProvider() {
  const nodes = useBoardStore((s) => s.nodes);
  const edges = useBoardStore((s) => s.edges);
  const setAll = useBoardStore((s) => s.setAll);

  const localRef = React.useRef<string>("");
  const lastPushedRef = React.useRef<string>("");
  const mountedRef = React.useRef(false);
  const postTimer = React.useRef<number | null>(null);

  // Initial pull (or seed if server empty)
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/board", { cache: "no-store" });
        const remote = (await res.json()) as { nodes: unknown[]; edges: unknown[] };
        const remoteState: BoardState = {
          nodes: Array.isArray(remote.nodes) ? (remote.nodes as any) : [],
          edges: Array.isArray(remote.edges) ? (remote.edges as any) : [],
        };
        const localState: BoardState = { nodes, edges };
        const remoteHash = hashState(remoteState);
        const localHash = hashState(localState);
        if (cancelled) return;
        if (remoteHash === hashState({ nodes: [], edges: [] })) {
          // Server empty → seed with local
          await fetch("/api/board", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(localState),
          });
          lastPushedRef.current = localHash;
        } else if (remoteHash !== localHash) {
          // Server has data → adopt it locally
          setAll(remoteState.nodes as any, remoteState.edges as any);
          lastPushedRef.current = remoteHash;
        } else {
          lastPushedRef.current = localHash;
        }
        localRef.current = hashState({ nodes: useBoardStore.getState().nodes, edges: useBoardStore.getState().edges });
      } catch {
        // ignore
      } finally {
        mountedRef.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced push on local changes
  React.useEffect(() => {
    if (!mountedRef.current) return;
    const newHash = hashState({ nodes, edges });
    localRef.current = newHash;
    if (postTimer.current) window.clearTimeout(postTimer.current);
    postTimer.current = window.setTimeout(async () => {
      try {
        if (newHash === lastPushedRef.current) return;
        await fetch("/api/board", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes, edges }),
        });
        lastPushedRef.current = newHash;
      } catch {
        // ignore transient errors
      }
    }, POST_DEBOUNCE_MS);
    return () => {
      if (postTimer.current) window.clearTimeout(postTimer.current);
    };
  }, [nodes, edges]);

  // Periodic pull to catch remote changes
  React.useEffect(() => {
    const id = window.setInterval(async () => {
      try {
        const res = await fetch("/api/board", { cache: "no-store" });
        const remote = (await res.json()) as { nodes: unknown[]; edges: unknown[] };
        const remoteState: BoardState = {
          nodes: Array.isArray(remote.nodes) ? (remote.nodes as any) : [],
          edges: Array.isArray(remote.edges) ? (remote.edges as any) : [],
        };
        const remoteHash = hashState(remoteState);
        if (remoteHash && remoteHash !== lastPushedRef.current && remoteHash !== localRef.current) {
          setAll(remoteState.nodes as any, remoteState.edges as any);
          lastPushedRef.current = remoteHash;
          localRef.current = remoteHash;
        }
      } catch {
        // ignore
      }
    }, SYNC_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [setAll]);

  return null;
}

