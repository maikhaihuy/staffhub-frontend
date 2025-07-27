interface ColumnConfig<T> {
  key: keyof T | string;
  label: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

export type { ColumnConfig };
