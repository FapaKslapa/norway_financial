import { Button } from "@heroui/react";
import { m } from "framer-motion";
import { FileSpreadsheet, Plus } from "lucide-react";

interface TransactionsPageHeaderProps {
  onNewTransaction: () => void;
  onImportCsv: () => void;
  onManageCategories: () => void;
}

export function TransactionsPageHeader({
  onNewTransaction,
  onImportCsv,
  onManageCategories,
}: TransactionsPageHeaderProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-row justify-between items-center gap-4 select-none mb-4 w-full"
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider hidden md:inline">
          Gestione Spese
        </span>
        <h2 className="text-lg md:text-2xl font-black tracking-tight">
          Transazioni
        </h2>
        <p className="text-(--text-muted) text-xs hidden md:block">
          Visualizza, filtra o importa le tue spese ed entrate
        </p>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
        <Button
          variant="outline"
          className="font-bold text-xs bg-blue-500 text-white border-0 hover:opacity-90 rounded-xl h-9 md:h-10 px-2.5 md:px-4 flex items-center justify-center gap-1 cursor-pointer shadow-sm"
          onPress={onNewTransaction}
        >
          <Plus size={13} />
          <span className="hidden sm:inline">Nuova Transazione</span>
          <span className="sm:hidden">Nuova</span>
        </Button>

        <Button
          variant="outline"
          className="font-semibold text-xs border-(--card-border) hover:bg-neutral-500/10 rounded-xl h-9 md:h-10 px-2.5 md:px-3 flex items-center justify-center gap-1.5 cursor-pointer text-foreground bg-(--card)"
          onPress={onImportCsv}
        >
          <FileSpreadsheet size={13} className="text-emerald-500" />
          <span className="hidden sm:inline">Importa CSV</span>
          <span className="sm:hidden">CSV</span>
        </Button>

        <Button
          variant="outline"
          className="font-semibold text-xs border-(--card-border) hover:bg-neutral-500/10 rounded-xl h-9 md:h-10 px-2.5 md:px-3 flex items-center justify-center gap-1.5 cursor-pointer text-foreground bg-(--card)"
          onPress={onManageCategories}
        >
          <span className="hidden sm:inline">Gestisci Categorie</span>
          <span className="sm:hidden">Categorie</span>
        </Button>
      </div>
    </m.div>
  );
}
