import { Branch } from "./types";
import {
  GenericTable,
  ColumnConfig,
} from "@/components/organisms/generic-table";
import PageNavigator from "@/components/organisms/page-navigator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type BranchListProp = {
  title: string;
  description?: string;
  data: Branch[];
  columns: ColumnConfig<Branch>[];
  page: number;
  pageSize: number;
  total: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
};

export default function BranchList({
  title,
  description,
  data,
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
        <CardTitle>{title}</CardTitle>
        {description ?? <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <GenericTable
          columns={columns}
          data={data}
          rowKey={(branch) => branch.id!}
        />
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
