"use client";

import { m } from "framer-motion";
import { FolderPlus } from "lucide-react";

type TodoHeaderProps = {
  onNewList: () => void;
};

export function TodoHeader({ onNewList }: TodoHeaderProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-row justify-between items-center gap-4 w-full select-none"
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider hidden md:inline">
          Liste da fare
        </span>
        <h2 className="text-lg md:text-2xl font-black tracking-tight">
          Shopping & Liste
        </h2>
        <p className="text-(--text-muted) text-xs hidden md:block">
          Gestisci più liste di cose da comprare ed importale come spese
        </p>
      </div>

      <button
        type="button"
        onClick={onNewList}
        className="font-bold text-xs bg-blue-500 hover:bg-blue-600 text-white border-0 rounded-xl h-9 md:h-10 px-3 md:px-4 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all shrink-0"
      >
        <FolderPlus size={14} />
        <span>Nuova Lista</span>
      </button>
    </m.div>
  );
}
