"use client";
import "reactflow/dist/style.css";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "reactflow";
import { TaskNode as TaskNodeType, DependencyEdge } from "@/types/board";
import { useEdges, useNodes, useBoardStore } from "@/store/useBoardStore";
import { TaskNode } from "@/components/TaskNode";
import { isValidConnection } from "@/lib/graph";
import { TopBar } from "@/components/TopBar";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";

const nodeTypes = { taskNode: TaskNode } as const;

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <TopBar />
      <div className="relative h-[calc(100vh-49px)] w-full">
        <ReactFlowProvider>
          <Canvas />
          <CreateTaskDialog />
        </ReactFlowProvider>
      </div>
    </div>
  );
}

function Canvas() {
  const nodes = useNodes();
  const edges = useEdges();
  const setAll = useBoardStore((s) => s.setAll);
  const addEdgeAction = useBoardStore((s) => s.addEdge);
  const removeEdgeAction = useBoardStore((s) => s.removeEdge);

  const onNodesChange = (changes: NodeChange[]) => {
    const next = applyNodeChanges(changes, nodes as any);
    setAll(next as TaskNodeType[], edges);
  };
  const onEdgesChange = (changes: EdgeChange[]) => {
    const next = applyEdgeChanges(changes, edges as any);
    setAll(nodes, next as DependencyEdge[]);
  };
  const onConnect = (conn: Connection) => {
    if (isValidConnection(conn, edges)) {
      addEdgeAction({
        source: conn.source!,
        target: conn.target!,
        sourceHandle: "bottom",
        targetHandle: "top",
        type: "smoothstep",
      });
    }
  };

  return (
    <ReactFlow
      nodes={nodes as any}
      edges={edges as any}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onEdgeClick={(_, edge) => removeEdgeAction(edge.id)}
      fitView
    >
      <MiniMap className="!right-2 !bottom-2 !left-auto !top-auto" />
      <Controls />
      <Background />
    </ReactFlow>
  );
}
