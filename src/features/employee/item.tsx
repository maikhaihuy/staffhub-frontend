import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Employee } from './types';
import { AvatarImage, AvatarFallback, Avatar } from '@radix-ui/react-avatar';

export function EmployeeItem({ employee }: { employee: Employee }) {
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
      <TableCell className="font-medium">{employee.name}</TableCell>
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
