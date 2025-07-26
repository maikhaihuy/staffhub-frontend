import { Label } from "../ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { PAGINATION } from "@/constants";

export type PageNavigatorProp = {
  page: number;
  pageSize: number;
  total: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
};
export default function PageNavigator({
  page,
  pageSize,
  total,
  setPage,
  setPageSize,
}: PageNavigatorProp) {
  const minPage = PAGINATION.DEFAULT_PAGE;
  const pageSizeOptions = PAGINATION.DEFAULT_PAGE_SIZE_OPTIONS;
  const maxPage = Math.ceil(total / pageSize);
  const pages = (
    <Select
      onValueChange={(value) => setPage(Number(value))}
      value={page.toString()}
    >
      <SelectTrigger>
        <SelectValue placeholder={page.toString()} />
      </SelectTrigger>
      <SelectContent>
        {Array.from(
          { length: maxPage - minPage + 1 },
          (_, i) => minPage + i
        ).map((page) => (
          <SelectItem key={page} value={page.toString()}>
            {page}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="flex flex-row gap-8">
      <div className="flex flex-row items-center gap-2">
        <Label htmlFor="rows-per-page" className="text-sm font-medium">
          Rows per page
        </Label>
        <Select
          onValueChange={(value) => {
            setPageSize(Number(value));
            setPage(minPage);
          }}
          value={pageSize.toString()}
        >
          <SelectTrigger>
            <SelectValue placeholder={pageSize.toString()} />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-row items-center gap-2 text-sm font-medium">
        Page {pages} of {maxPage} ({total} items)
      </div>
      <div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationFirst onClick={() => setPage(minPage)} />
              <PaginationPrevious
                onClick={() => setPage(Math.max(page - 1, minPage))}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(Math.min(page + 1, maxPage))}
              />
              <PaginationLast onClick={() => setPage(maxPage)} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
