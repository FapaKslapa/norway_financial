"use client";

import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { FileSpreadsheet, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { CustomSelect } from "@/components/ui/custom-select";
import { formatCurrency } from "@/lib/utils";

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

type PreviewRow = {
  date: string;
  description: string;
  amount: number;
  type: "expense" | "income";
  currency: string;
  categoryId: string | null;
};

const CSV_FIELD_LABELS: Record<string, string> = {
  date: "Data",
  description: "Descrizione",
  amount: "Importo",
  currency: "Valuta",
  category: "Categoria",
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

export function CsvImportModal({
  isOpen,
  onClose,
  categories,
  onImport,
}: CsvImportModalProps) {
  const { rates } = useDashboard();

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [csvMapping, setCsvMapping] = useState<Record<string, string>>({
    date: "",
    description: "",
    amount: "",
    currency: "",
    category: "",
  });
  const [csvPreviewRows, setCsvPreviewRows] = useState<PreviewRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);

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

  useEffect(() => {
    if (csvRows.length === 0 || !csvMapping.amount) {
      setCsvPreviewRows([]);
      return;
    }

    const preview: PreviewRow[] = csvRows.map((row) => {
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

    setCsvPreviewRows(preview);
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
      setCsvFile(null);
      setCsvHeaders([]);
      setCsvRows([]);
      setCsvPreviewRows([]);
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-(--card-solid) border border-(--card-border) w-full max-w-[620px] rounded-3xl p-6 shadow-2xl text-foreground flex flex-col max-h-[85vh]"
          >
            {}
            <div className="flex justify-between items-center pb-4 border-b border-(--card-border) mb-4">
              <h3 className="font-extrabold text-base">Importazione da CSV</h3>
              <button
                type="button"
                className="text-(--text-muted) rounded-lg hover:bg-neutral-500/10 h-7 w-7 border-0 cursor-pointer bg-transparent flex items-center justify-center transition-all"
                onClick={onClose}
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
              {}
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
                  accept=".csv"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleCsvChange}
                />
              </div>

              {}
              {csvRows.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wide">
                    Mappa Colonne CSV
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-neutral-500/5 p-3 rounded-xl border border-(--card-border) overflow-visible">
                    {Object.keys(csvMapping).map((field) => (
                      <div
                        key={field}
                        className="flex flex-col gap-1 overflow-visible relative z-30"
                      >
                        <span className="text-[9px] text-(--text-muted) font-bold uppercase tracking-wider">
                          {CSV_FIELD_LABELS[field] ?? field}
                        </span>
                        <CustomSelect
                          value={csvMapping[field]}
                          onChange={(val) =>
                            setCsvMapping((prev) => ({ ...prev, [field]: val }))
                          }
                          placeholder="(Ignora/Default)"
                          triggerClassName="h-9"
                          options={[
                            { value: "", label: "(Ignora/Default)" },
                            ...csvHeaders.map((header) => ({
                              value: header,
                              label: header,
                            })),
                          ]}
                        />
                      </div>
                    ))}
                  </div>

                  {}
                  <div className="flex justify-between items-center mt-2 px-1">
                    <span className="text-xs font-bold font-sans">
                      Anteprima ({csvPreviewRows.length} righe)
                    </span>
                  </div>

                  <div className="border border-(--card-border) rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-neutral-500/5 border-b border-(--card-border) text-[9px] text-(--text-muted) font-bold uppercase">
                          <th className="p-2">Data</th>
                          <th className="p-2">Descrizione</th>
                          <th className="p-2">Importo</th>
                          <th className="p-2">Categoria</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreviewRows.slice(0, 5).map((row) => {
                          const matchedCat = categories.find(
                            (c) => c.id === row.categoryId,
                          );
                          return (
                            <tr
                              key={`${row.date}-${row.amount}-${row.description}`}
                              className="border-b border-(--card-border) last:border-0"
                            >
                              <td className="p-2">
                                {new Date(row.date).toLocaleDateString("it-IT")}
                              </td>
                              <td className="p-2 font-semibold truncate max-w-[120px]">
                                {row.description}
                              </td>
                              <td className="p-2 font-bold font-mono">
                                {row.type === "expense" ? "-" : "+"}{" "}
                                {formatCurrency(row.amount, row.currency)}
                              </td>
                              <td className="p-2">
                                {matchedCat ? (
                                  <span
                                    className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
                                    style={{
                                      backgroundColor: matchedCat.color,
                                    }}
                                  >
                                    {matchedCat.name}
                                  </span>
                                ) : (
                                  <span className="text-(--text-muted) font-medium">
                                    Generale
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {}
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
