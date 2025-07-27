interface ColumnConfig<T> {
  key: keyof T | string;
  label: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

interface QueryRequest<T> {
  search?: T;
  orderBy?: keyof T;
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
  all?: boolean;
}

export type { ColumnConfig, QueryRequest };
