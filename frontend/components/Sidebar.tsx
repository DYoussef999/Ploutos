'use client';

import { TrendingUp, ArrowDownCircle, Info } from 'lucide-react';

interface PaletteItemProps {
  label: string;
  description: string;
  nodeType: string;
  icon: React.ReactNode;
  borderClass: string;
  bgClass: string;
}

/** A single draggable item in the node palette */
function PaletteItem({ label, description, nodeType, icon, borderClass, bgClass }: PaletteItemProps) {
  const onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/reactflow', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`flex items-start gap-3 p-3 rounded-lg border-2 ${borderClass} ${bgClass} cursor-grab active:cursor-grabbing hover:brightness-110 transition-all select-none`}
    >
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-zinc-100 leading-tight">{label}</p>
        <p className="text-xs text-zinc-500 mt-0.5 leading-tight">{description}</p>
      </div>
    </div>
  );
}

/**
 * Sidebar — the node palette panel.
 * Users drag items from here onto the React Flow canvas to spawn new nodes.
 * Uses the native HTML5 drag-and-drop API — no external DnD library needed.
 */
export default function Sidebar() {
  return (
    <aside className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col p-4 gap-6 shrink-0 z-10">
      <div>
        <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
          Node Palette
        </h2>

        <div className="space-y-2.5">
          <PaletteItem
            label="Add Revenue"
            description="Sales, grants, subscriptions"
            nodeType="source"
            icon={<TrendingUp className="w-4 h-4 text-green-400" />}
            borderClass="border-green-800"
            bgClass="bg-green-950"
          />
          <PaletteItem
            label="Add Expense"
            description="Wages, rent, inventory"
            nodeType="expense"
            icon={<ArrowDownCircle className="w-4 h-4 text-red-400" />}
            borderClass="border-red-800"
            bgClass="bg-red-950"
          />
        </div>
      </div>

      <div className="mt-auto flex gap-2 p-3 rounded-lg bg-zinc-800 border border-zinc-700">
        <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Drag nodes onto the canvas, then draw a line to the{' '}
          <span className="text-yellow-600 font-medium">Net Profit</span> card to see your bottom line update live.
        </p>
      </div>
    </aside>
  );
}
