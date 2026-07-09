"use client";

import dayjs from "dayjs";
import { AnimatePresence, m } from "framer-motion";
import { X } from "lucide-react";
import type React from "react";
import { useMemo, useReducer, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { CsvMappingPreview } from "./csv-import/csv-mapping-preview";
import { CsvUploadZone } from "./csv-import/csv-upload-zone";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type ImportRow = {
  type: "expense" | "income";
  amount: number;
  currency: string;
  exchangeRate: number;
  exchangeRateNok: number;
  description: string;
  categoryId: string | null;
  date: string;
};

type CsvImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onImport: (rows: ImportRow[]) => Promise<void>;
};

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === "," || char === ";") && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function parseCurrencyCode(raw: string, fallback = "EUR"): string {
  const clean = raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  const match = clean.match(/[A-Z]{3}/);
  return match ? match[0] : fallback;
}

type CsvImportState = {
  csvFile: File | null;
  csvHeaders: string[];
  csvRows: Record<string, string>[];
  csvMapping: Record<string, string>;
  isImporting: boolean;
};

type CsvImportAction =
  | { type: "SET_FIELD"; field: keyof CsvImportState; value: any }
  | { type: "RESET" };

function csvImportReducer(state: CsvImportState, action: CsvImportAction): CsvImportState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return {
        csvFile: null,
        csvHeaders: [],
        csvRows: [],
        csvMapping: {
          date: "",
          description: "",
          amount: "",
          currency: "",
          category: "",
        },
        isImporting: false,
      };
    default:
      return state;
  }
}

export function CsvImportModal({
  isOpen,
  onClose,
  categories,
  onImport,
}: CsvImportModalProps) {
  const { rates } = useDashboard();

  const [state, dispatch] = useReducer(csvImportReducer, {
    csvFile: null,
    csvHeaders: [],
    csvRows: [],
    csvMapping: {
      date: "",
      description: "",
      amount: "",
      currency: "",
      category: "",
    },
    isImporting: false,
  });

  const { csvFile, csvHeaders, csvRows, csvMapping, isImporting } = state;

  const setCsvFile = (val: File | null) => dispatch({ type: "SET_FIELD", field: "csvFile", value: val });
  const setCsvHeaders = (val: string[]) => dispatch({ type: "SET_FIELD", field: "csvHeaders", value: val });
  const setCsvRows = (val: Record<string, string>[]) => dispatch({ type: "SET_FIELD", field: "csvRows", value: val });
  const setCsvMapping = (val: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => {
    if (typeof val === "function") {
      dispatch({ type: "SET_FIELD", field: "csvMapping", value: val(csvMapping) });
    } else {
      dispatch({ type: "SET_FIELD", field: "csvMapping", value: val });
    }
  };
  const setIsImporting = (val: boolean) => dispatch({ type: "SET_FIELD", field: "isImporting", value: val });

  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) return;

      const headers = parseCSVLine(lines[0]).map((h) =>
        h.trim().replace(/^"|"$/g, ""),
      );
      setCsvHeaders(headers);

      const parsedRows = lines.slice(1).map((line) => {
        const vals = parseCSVLine(line).map((v) =>
          v.trim().replace(/^"|"$/g, ""),
        );
        const row: Record<string, string> = {};
        headers.forEach((h, i) => {
          row[h] = vals[i] ?? "";
        });
        return row;
      });
      setCsvRows(parsedRows);

      const autoMapping: Record<string, string> = {
        date: "",
        description: "",
        amount: "",
        currency: "",
        category: "",
      };
      headers.forEach((h) => {
        const lower = h.toLowerCase();
        if (!autoMapping.date && /dat|date|giorno/.test(lower))
          autoMapping.date = h;
        else if (!autoMapping.description && /desc|causale|note/.test(lower))
          autoMapping.description = h;
        else if (
          !autoMapping.amount &&
          /importo|ammontare|amount|valore/.test(lower)
        )
          autoMapping.amount = h;
        else if (!autoMapping.currency && /valuta|curr/.test(lower))
          autoMapping.currency = h;
        else if (!autoMapping.category && /categ|tipo/.test(lower))
          autoMapping.category = h;
      });
      setCsvMapping(autoMapping);
    };
    reader.readAsText(file);
  };

  const csvPreviewRows = useMemo(() => {
    if (csvRows.length === 0 || !csvMapping.amount) {
      return [];
    }

    return csvRows.map((row) => {
      const parsedDate = csvMapping.date
        ? dayjs(row[csvMapping.date])
        : dayjs();
      const dateVal = parsedDate.isValid() ? parsedDate : dayjs();
      const rawAmount = (row[csvMapping.amount] || "0").replace(",", ".");
      const amountVal = parseFloat(rawAmount) || 0;
      const currency = csvMapping.currency
        ? parseCurrencyCode(row[csvMapping.currency], "EUR")
        : "EUR";
      const description = row[csvMapping.description] || "Transazione CSV";

      let categoryId: string | null = null;
      if (csvMapping.category && row[csvMapping.category]) {
        const search = row[csvMapping.category].trim().toLowerCase();
        const found = categories.find((c) =>
          c.name.toLowerCase().includes(search),
        );
        if (found) categoryId = found.id;
      }

      return {
        date: dateVal.toISOString(),
        description,
        amount: Math.abs(amountVal),
        type: amountVal >= 0 ? ("income" as const) : ("expense" as const),
        currency,
        categoryId,
      };
    });
  }, [csvRows, csvMapping, categories]);

  const handleCsvImportSubmit = async () => {
    if (csvPreviewRows.length === 0 || isImporting) return;
    setIsImporting(true);

    try {
      const nokRate = rates.NOK ?? 11.85;
      const dataToImport: ImportRow[] = csvPreviewRows.map((row) => ({
        type: row.type,
        amount: row.amount,
        currency: row.currency,
        exchangeRate: rates[row.currency] ?? 1,
        exchangeRateNok: nokRate,
        description: row.description,
        categoryId: row.categoryId,
        date: row.date,
      }));

      await onImport(dataToImport);
      dispatch({ type: "RESET" });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-(--card-solid) border border-(--card-border) w-full max-w-[620px] rounded-3xl p-6 shadow-2xl text-foreground flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-(--card-border) mb-4">
              <h3 className="font-extrabold text-base">Importazione da CSV</h3>
              <button
                type="button"
                aria-label="Chiudi"
                className="text-(--text-muted) rounded-lg hover:bg-neutral-500/10 h-7 w-7 border-0 cursor-pointer bg-transparent flex items-center justify-center transition-all"
                onClick={onClose}
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
              {/* Upload zone */}
              <CsvUploadZone csvFile={csvFile} onChange={handleCsvChange} />

              {/* Mapping + preview */}
              {csvRows.length > 0 && (
                <CsvMappingPreview
                  csvHeaders={csvHeaders}
                  csvMapping={csvMapping}
                  onMappingChange={(field, val) =>
                    setCsvMapping((prev) => ({ ...prev, [field]: val }))
                  }
                  csvPreviewRows={csvPreviewRows}
                  categories={categories}
                />
              )}
            </div>

            {/* Footer actions */}
            <div className="pt-4 border-t border-(--card-border) mt-4 flex gap-3">
              <button
                type="button"
                className="flex-1 border border-(--card-border) hover:bg-neutral-500/10 text-xs rounded-xl h-11 text-foreground bg-transparent cursor-pointer flex items-center justify-center transition-all"
                onClick={onClose}
              >
                Annulla
              </button>
              <button
                type="button"
                disabled={csvPreviewRows.length === 0 || isImporting}
                className="flex-1 bg-emerald-500 text-white border-0 hover:opacity-90 text-xs rounded-xl h-11 cursor-pointer flex items-center justify-center transition-all disabled:opacity-50"
                onClick={handleCsvImportSubmit}
              >
                {isImporting
                  ? "Importazione..."
                  : `Importa ${csvPreviewRows.length} elementi`}
              </button>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
