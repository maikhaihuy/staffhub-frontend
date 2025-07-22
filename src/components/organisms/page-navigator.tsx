import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
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
  const delta = 3;
  const minPage = 1;
  const pageSizeOptions = [1, 2, 5];
  const maxPage = Math.ceil(total / pageSize);
  const curPage = page;
  const startPage = curPage - delta > minPage ? curPage - delta : minPage;
  const endPage = curPage + delta < maxPage ? curPage + delta : maxPage;
  const pages = [];
  if (startPage > minPage) {
    pages.push(
      <PaginationItem key="pre-page">
        <PaginationEllipsis />
      </PaginationItem>
    );
  }
  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <PaginationItem key={i}>
        <PaginationLink isActive={i === curPage} onClick={() => setPage(i)}>
          {i}
        </PaginationLink>
      </PaginationItem>
    );
  }
  if (endPage < maxPage) {
    pages.push(
      <PaginationItem key="post-page">
        <PaginationEllipsis />
      </PaginationItem>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <Select
        onValueChange={(value) => {
          setPageSize(Number(value));
          setPage(minPage);
        }}
        value={pageSize.toString()}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={pageSize.toString()} />
        </SelectTrigger>
        <SelectContent>
          {pageSizeOptions.map((size) => (
            <SelectItem key={size} value={size.toString()}>
              {size} items per page
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {total} items
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => setPage(Math.max(curPage - 1, minPage))}
            />
          </PaginationItem>
          {pages}
          <PaginationItem>
            <PaginationNext
              onClick={() => setPage(Math.min(curPage + 1, maxPage))}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
