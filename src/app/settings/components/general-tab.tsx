"use client";

import { Check, Moon, Sun } from "lucide-react";
import { CurrencySelect } from "@/components/ui/currency-select";
import { ACCENT_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type GeneralTabProps = {
  preferredCurrency: string;
  setPreferredCurrency: (val: string) => void;
  theme: "light" | "dark";
  changeTheme: (theme: "light" | "dark") => void;
  accent: string;
  changeAccent: (accent: string) => void;
};

export function GeneralTab({
  preferredCurrency,
  setPreferredCurrency,
  theme,
  changeTheme,
  accent,
  changeAccent,
}: GeneralTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Currency */}
      <div className="bg-(--card-solid) border border-(--card-border) rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl shrink-0">
            <Check size={14} />
          </div>
          <div>
            <p className="text-xs font-black">Valuta Preferita</p>
            <p className="text-[10px] text-(--text-muted)">
              Usata in tutta l&apos;app
            </p>
          </div>
        </div>
        <CurrencySelect
          value={preferredCurrency}
          onChange={setPreferredCurrency}
          triggerClassName="h-11 text-xs rounded-xl"
        />
      </div>

      {/* Theme */}
      <div className="bg-(--card-solid) border border-(--card-border) rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl shrink-0">
            <Sun size={14} />
          </div>
          <div>
            <p className="text-xs font-black">Modalità Tema</p>
            <p className="text-[10px] text-(--text-muted)">Chiaro o scuro</p>
          </div>
        </div>
        <div className="flex rounded-xl bg-neutral-100 dark:bg-zinc-800/30 p-1 border border-(--card-border)/40">
          <button
            type="button"
            onClick={() => changeTheme("light")}
            className={cn(
              "flex-1 py-2.5 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer flex items-center justify-center gap-2 bg-transparent",
              theme === "light"
                ? "bg-foreground text-background shadow-sm"
                : "text-(--text-muted) hover:text-foreground",
            )}
          >
            <Sun size={13} /> Chiaro
          </button>
          <button
            type="button"
            onClick={() => changeTheme("dark")}
            className={cn(
              "flex-1 py-2.5 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer flex items-center justify-center gap-2 bg-transparent",
              theme === "dark"
                ? "bg-foreground text-background shadow-sm"
                : "text-(--text-muted) hover:text-foreground",
            )}
          >
            <Moon size={13} /> Scuro
          </button>
        </div>
      </div>

      {/* Accent colors — full width */}
      <div className="md:col-span-2 bg-(--card-solid) border border-(--card-border) rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-500 rounded-xl shrink-0">
            <Check size={14} />
          </div>
          <div>
            <p className="text-xs font-black">Colore Accento</p>
            <p className="text-[10px] text-(--text-muted)">
              Colore principale dell&apos;interfaccia
            </p>
          </div>
        </div>
        <div className="flex gap-4 flex-wrap">
          {ACCENT_COLORS.map((col) => (
            <button
              key={col.id}
              type="button"
              onClick={() => changeAccent(col.id)}
              className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 group"
            >
              <div
                className="h-10 w-10 rounded-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-sm"
                style={{ backgroundColor: col.primary }}
              >
                {accent === col.id && (
                  <Check
                    size={16}
                    className="text-white drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.4)]"
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-[9px] font-bold transition-colors",
                  accent === col.id ? "text-foreground" : "text-(--text-muted)",
                )}
              >
                {col.name.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
