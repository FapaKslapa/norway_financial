"use client";

import { FileSpreadsheet } from "lucide-react";
import type React from "react";

type CsvUploadZoneProps = {
  csvFile: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function CsvUploadZone({ csvFile, onChange }: CsvUploadZoneProps) {
  return (
    <div className="border-2 border-dashed border-(--card-border) rounded-2xl p-6 flex flex-col items-center justify-center gap-2 bg-neutral-500/5 text-center relative">
      <FileSpreadsheet size={32} className="text-emerald-500 mb-1" />
      {csvFile ? (
        <span className="text-xs font-bold truncate max-w-full text-emerald-500">
          {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
        </span>
      ) : (
        <>
          <span className="text-xs font-bold">
            Trascina qui il file CSV o clicca per caricarlo
          </span>
          <span className="text-[10px] text-(--text-muted)">
            Usa separatore virgola (,) o punto e virgola (;)
          </span>
        </>
      )}
      <input
        type="file"
        aria-label="Carica file CSV"
        accept=".csv"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={onChange}
      />
    </div>
  );
}
