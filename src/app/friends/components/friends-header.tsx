"use client";

import { Button } from "@heroui/react";
import { m } from "framer-motion";
import { Plus, Users } from "lucide-react";

interface FriendsHeaderProps {
  hasFriends: boolean;
  onAddExpense: () => void;
}

export function FriendsHeader({ hasFriends, onAddExpense }: FriendsHeaderProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-row justify-between items-center gap-4 w-full"
    >
      <div>
        <h2 className="text-lg md:text-2xl font-black tracking-tight flex items-center gap-1.5 md:gap-2">
          <Users size={18} className="text-blue-500 md:w-[24px] md:h-[24px]" />
          <span>Amici &amp; Spese</span>
        </h2>
        <p className="text-(--text-muted) text-xs font-semibold hidden md:block">
          Gestisci la tua rubrica e dividi le spese con singoli amici o gruppi
        </p>
      </div>
      <Button
        variant="outline"
        className="font-bold text-xs bg-blue-500 text-white border-0 hover:bg-blue-600 rounded-xl h-9 md:h-10 px-3 md:px-4 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shrink-0"
        onPress={onAddExpense}
        isDisabled={!hasFriends}
      >
        <Plus size={13} />
        <span className="hidden sm:inline">Aggiungi Spesa Condivisa</span>
        <span className="sm:hidden">Nuova Spesa</span>
      </Button>
    </m.div>
  );
}
