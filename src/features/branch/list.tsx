import { getBranches } from "./api";
import BranchForm from "./form";
import { BranchItem } from "./item";
import { Branch } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";

function TableCellViewer({ item }: { item: Branch }) {
  const isMobile = useIsMobile();
  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left"
        >
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.name}</DrawerTitle>
          <DrawerDescription>Display the</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <BranchForm branchId={item.id} />
        </div>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

type ColumnConfig<T> = {
  key: keyof T | string;
  label: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
};

const columns: ColumnConfig<Branch>[] = [
  {
    key: "name",
    label: "Name",
    render => TableCellViewer()
  },
  {
    key: "abbreviation",
    label: "Abbreviation",
    render: (branch) => (
      <Badge variant="outline" className="capitalize">
        {branch.abbreviation}
      </Badge>
    ),
  },
  {
    key: "email",
    label: "Email",
    className: "hidden md:table-cell",
  },
  {
    key: "phone",
    label: "Phone",
    className: "hidden md:table-cell",
  },
  {
    key: "address",
    label: "Address",
    className: "hidden md:table-cell",
  },
  {
    key: "actions",
    label: "",
    render: (branch) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-haspopup="true" size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>
            <form action={() => {}}>
              <button type="submit">Delete</button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function BranchList() {
  const { data, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: getBranches,
  });

  if (isLoading) return <p>Loading...</p>;

  

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
        {data?.map((branch) => (
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
  );
}
