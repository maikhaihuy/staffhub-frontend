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
import { Employee } from './types';
import { AvatarImage, AvatarFallback, Avatar } from '@radix-ui/react-avatar';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import EmployeeForm from './form';
import { MoreHorizontal } from 'lucide-react';

export function EmployeeItem({ employee }: { employee: Employee }) {
  function TableCellViewer({ item }: { item: Employee }) {
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
            <EmployeeForm />
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
          <Avatar className="rounded-lg" key={employee.id}>
            <AvatarImage src={employee.avatar} />
            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </TableCell>
      <TableCell className="font-medium">
        <TableCellViewer item={employee} />
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {employee.status}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">{employee.level}</TableCell>
      <TableCell className="hidden md:table-cell">{employee.branch}</TableCell>
      <TableCell className="hidden md:table-cell">
        {employee.availableAt}
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


