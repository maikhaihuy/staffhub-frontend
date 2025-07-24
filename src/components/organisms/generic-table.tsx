import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import React from "react";

export type ColumnConfig<T> = {
  key: keyof T | string;
  label: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
};

type GenericTableProps<T> = {
  columns: ColumnConfig<T>[];
  data: T[];
  rowKey: (item: T) => React.Key;
  emptyMessage?: React.ReactNode;
};

export function GenericTable<T>({
  columns,
  data,
  rowKey,
  emptyMessage = "No data available.",
}: GenericTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.key as string} className={col.className}>
              {col.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={rowKey(item)}>
              {columns.map((col) => (
                <TableCell key={col.key as string} className={col.className}>
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
