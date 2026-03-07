/*
<!-- ARCHITECTURE DECISION -->

STATE: All node values live in React Flow's `useNodesState` (single source of truth).
      Updating a node's value calls setNodes with an immutable map — no external store needed.

REACTIVITY: ResultNode calls `useNodes()` + `useEdges()` (React Flow context hooks) directly
      inside the node component, then passes them to `useFinancialCalculation` (useMemo).
      This means ResultNode self-subscribes to graph changes with zero prop-drilling —
      no sync useEffect needed in the parent.

NODE REGISTRY: `nodeTypes` is a stable object defined OUTSIDE the component so React Flow
      never re-registers types on re-render. Adding a new node type = one line in this object.
*/

'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  type ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import SourceNode from '@/components/nodes/SourceNode';
import ExpenseNode from '@/components/nodes/ExpenseNode';
import ResultNode from '@/components/nodes/ResultNode';
import Sidebar from '@/components/Sidebar';
import { createSourceNode, createExpenseNode, createResultNode } from '@/utils/nodeFactory';
import type { AnyNodeData } from '@/types/nodes';

/** Stable registry — add a new node type here without touching any other file */
const nodeTypes: NodeTypes = {
  source: SourceNode,
  expense: ExpenseNode,
  result: ResultNode,
};

// Typed as Node<AnyNodeData>[] so useNodesState can hold mixed source/expense/result nodes
const DEFAULT_NODES: Node<AnyNodeData>[] = [createResultNode({ x: 680, y: 180 })];
const DEFAULT_EDGES: Edge[] = [];

const miniMapColor = (node: Node): string => {
  if (node.type === 'source') return '#22c55e';
  if (node.type === 'expense') return '#ef4444';
  return '#facc15';
};

const edgeStrokeForSource = (nodes: Node[], sourceId: string): string => {
  const src = nodes.find((n) => n.id === sourceId);
  if (src?.type === 'source') return '#22c55e';
  if (src?.type === 'expense') return '#ef4444';
  return '#facc15';
};

/**
 * FinancialSandbox — the main canvas orchestrator for Compass AI.
 * Manages node/edge state and wires drag-and-drop node creation from the Sidebar.
 */
export default function FinancialSandbox() {
  const [nodes, setNodes, onNodesChange] = useNodesState<AnyNodeData>(DEFAULT_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(DEFAULT_EDGES);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            type: 'smoothstep',
            style: {
              stroke: edgeStrokeForSource(nodes, connection.source ?? ''),
              strokeWidth: 2,
            },
          },
          eds
        )
      );
    },
    [nodes, setEdges]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!rfInstance) return;

      const type = e.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = rfInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const newNode =
        type === 'source' ? createSourceNode(position) : createExpenseNode(position);

      setNodes((nds) => nds.concat(newNode));
    },
    [rfInstance, setNodes]
  );

  return (
    <div className="flex h-full bg-zinc-950">
      <Sidebar />

      <div className="flex-1 h-full" onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setRfInstance}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          deleteKeyCode="Backspace"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#3f3f46" />
          <Controls className="!bg-zinc-800 !border-zinc-700 [&>button]:!bg-zinc-800 [&>button]:!border-zinc-600 [&>button]:!text-zinc-300" />
          <MiniMap
            nodeColor={miniMapColor}
            className="!bg-zinc-900 !border !border-zinc-700"
            maskColor="rgba(9,9,11,0.6)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
