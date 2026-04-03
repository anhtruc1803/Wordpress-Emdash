"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { ArrowDownWideNarrow } from "lucide-react";

import { useLocale } from "@/components/layout/locale-provider";
import { Input, Select } from "@/components/layout/form-controls";
import { cn } from "@/lib/utils";

export interface DataTableFilterOption {
  label: string;
  value: string;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = "Tìm kiếm",
  searchValueResolver,
  filters = [],
  emptyLabel = "Không có dòng dữ liệu nào."
}: {
  data: T[];
  columns: Array<ColumnDef<T, any>>;
  searchPlaceholder?: string;
  searchValueResolver?: (row: T) => string;
  filters?: Array<{
    key: string;
    label: string;
    options: DataTableFilterOption[];
    predicate: (row: T, value: string) => boolean;
  }>;
  emptyLabel?: string;
}) {
  const { locale } = useLocale();
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesSearch =
        !search || (searchValueResolver?.(row) ?? JSON.stringify(row)).toLowerCase().includes(search.toLowerCase());

      const matchesFilters = filters.every((filter) => {
        const selected = filterValues[filter.key];
        return !selected ? true : filter.predicate(row, selected);
      });

      return matchesSearch && matchesFilters;
    });
  }, [data, filterValues, filters, search, searchValueResolver]);

  const table = useReactTable<T>({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={searchPlaceholder} className="md:max-w-sm" />
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <Select
                key={filter.key}
                value={filterValues[filter.key] ?? ""}
                onChange={(event) =>
                  setFilterValues((current) => ({
                    ...current,
                    [filter.key]: event.target.value
                  }))
                }
                className="min-w-40"
              >
                <option value="">
                  {filter.label}: {locale === "vi" ? "Tất cả" : "All"}
                </option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            ))}
          </div>
        </div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          <ArrowDownWideNarrow className="h-4 w-4" />
          {locale === "vi" ? "Bấm tiêu đề cột để sắp xếp" : "Click a column header to sort"}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-panel-strong text-left">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="border-b border-line px-4 py-3 font-semibold text-slate-700">
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          className={cn(
                            "inline-flex items-center gap-2",
                            header.column.getCanSort() ? "transition hover:text-slate-950" : "cursor-default"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-muted" colSpan={columns.length}>
                    {emptyLabel}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-line last:border-b-0 hover:bg-slate-50/70">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-top text-slate-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
