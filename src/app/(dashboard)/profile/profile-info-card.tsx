import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Employee } from "@/features/employee/types";

type ProfileInfoCardProps = {
  phone: string;
  role?: string;
  employee?: Employee;
};

export function ProfileInfoCard({ phone, role, employee }: ProfileInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{employee?.fullName ?? "Thông tin của tôi"}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Số điện thoại</span>
          <span className="font-medium">{employee?.phoneNumber ?? phone}</span>
        </div>
        {role && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Vai trò</span>
            <span className="font-medium capitalize">{role}</span>
          </div>
        )}
        {employee && employee.branches && employee.branches.length > 0 && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Chi nhánh</span>
            <div className="flex flex-wrap justify-end gap-1">
              {employee.branches.map((branch) => (
                <Badge key={branch.id} variant="outline">
                  {branch.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
