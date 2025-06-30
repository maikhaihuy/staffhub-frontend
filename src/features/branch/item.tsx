import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import { Branch } from './types';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import BranchForm from './form';
import { MoreHorizontal } from 'lucide-react';

export function BranchItem({ branch }: { branch: Branch }) {
  function TableCellViewer({ item }: { item: Branch }) {
    const isMobile = useIsMobile()
    return (
      <Drawer direction={isMobile ? "bottom" : "right"}>
        <DrawerTrigger asChild>
          <Button variant="link" className="text-foreground w-fit px-0 text-left">
            {item.name}
          </Button>
        </DrawerTrigger>
        <DrawerContent onInteractOutside={(e) => {
          e.preventDefault();
        }}>
          <DrawerHeader className="gap-1">
            <DrawerTitle>{item.name}</DrawerTitle>
            <DrawerDescription>
              Display the 
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
            <BranchForm branchId={branch.id}/>
          </div>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Done</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <TableRow>
      <TableCell className="hidden sm:table-cell">
        <div className="flex space-x-4">
          {branch.name}
        </div>
      </TableCell>
      <TableCell className="font-medium">
        <TableCellViewer item={branch} />
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {branch.abbreviation}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">{branch.email}</TableCell>
      <TableCell className="hidden md:table-cell">{branch.phone}</TableCell>
      <TableCell className="hidden md:table-cell">
        {branch.address}
      </TableCell>
      <TableCell>
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
      </TableCell>
    </TableRow>
  );
}
