"use client";

import { CustomSelect } from "@/components/ui/custom-select";
import { formatCurrency } from "@/lib/utils";

const CSV_FIELD_LABELS: Record<string, string> = {
  date: "Data",
  description: "Descrizione",
  amount: "Importo",
  currency: "Valuta",
  category: "Categoria",
};

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type PreviewRow = {
  date: string;
  description: string;
  amount: number;
  type: "expense" | "income";
  currency: string;
  categoryId: string | null;
};

type CsvMappingPreviewProps = {
  csvHeaders: string[];
  csvMapping: Record<string, string>;
  onMappingChange: (field: string, val: string) => void;
  csvPreviewRows: PreviewRow[];
  categories: Category[];
};

export function CsvMappingPreview({
  csvHeaders,
  csvMapping,
  onMappingChange,
  csvPreviewRows,
  categories,
}: CsvMappingPreviewProps) {
  return (
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
              onChange={(val) => onMappingChange(field, val)}
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

      {/* Preview table */}
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
  );
}
