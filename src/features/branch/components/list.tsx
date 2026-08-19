import { useGetBranches } from "../hooks/useBranchQueries";
import { Branch } from "../types";
import {
  GenericTable,
  ColumnConfig,
} from "@/components/shared/generic-table";
import PageNavigator from "@/components/shared/page-navigator";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { PAGINATION } from "@/constants";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";

type BranchListProp = {
  columns: ColumnConfig<Branch>[];
};

function BranchListHeader() {
  return (
    <div className="flex flex-row justify-between">
      <div className="flex flex-row gap-2">
        <Input placeholder="Search branches..." className="w-md" />
        <Button>Search</Button>
      </div>
      <Button disabled={true}>Column</Button>
    </div>
  );
}

export default function BranchList({ columns }: BranchListProp) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageIntial =
    parseInt(searchParams?.get("page") || "", 10) || PAGINATION.DEFAULT_PAGE;
  const pageSizeInitial =
    parseInt(searchParams?.get("pageSize") || "", 10) ||
    PAGINATION.DEFAULT_PAGE_SIZE;

  const [pageSize, setPageSize] = useState(pageSizeInitial);
  const [page, setPage] = useState(pageIntial);

  const handleSetPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("page", newPage.toString());
    router.replace(`?${params.toString()}`);

    setPage(newPage);
  };

  const handleSetPageSize = (newPageSize: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("pageSize", newPageSize.toString());
    params.set("page", "1"); // reset to first page
    router.replace(`?${params.toString()}`);

    setPageSize(newPageSize);
    setPage(1); // reset to first page
  };

  // The backend's GET /branches has no pagination (always returns the full
  // list) - paginate client-side over the full result instead.
  const { data: branches, isLoading } = useGetBranches();
  const total = branches?.length ?? 0;
  const pageData = (branches ?? []).slice((page - 1) * pageSize, page * pageSize);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col gap-4">
      <BranchListHeader />
      <div className="overflow-hidden rounded-lg border">
        <GenericTable
          columns={columns}
          data={pageData}
          rowKey={(branch) => branch.id!}
        />
      </div>
      <PageNavigator
        page={page}
        pageSize={pageSize}
        total={total}
        setPage={handleSetPage}
        setPageSize={handleSetPageSize}
      />
    </div>
  );
}
