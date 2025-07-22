import { Branch } from "./types";
import PageNavigator from "@/components/organisms/page-navigator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

type ColumnConfig<T> = {
  key: keyof T | string;
  label: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
};

type BranchListProp = {
  branches: Branch[];
  columns: ColumnConfig<Branch>[];
  page: number;
  pageSize: number;
  total: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
};

export default function BranchList({
  branches,
  columns,
  page,
  pageSize,
  total,
  setPage,
  setPageSize,
}: BranchListProp) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chi nhánh</CardTitle>
        <CardDescription>Thông tin chi tiết các nhi nhánh</CardDescription>
      </CardHeader>
      <CardContent>
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
            {branches?.map((branch) => (
              <TableRow key={branch.id}>
                {columns.map((col) => (
                  <TableCell key={col.key as string} className={col.className}>
                    {col.render ? col.render(branch) : (branch as any)[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PageNavigator
          page={page}
          pageSize={pageSize}
          total={total}
          setPage={setPage}
          setPageSize={setPageSize}
        />
      </CardContent>
    </Card>
  );
}
