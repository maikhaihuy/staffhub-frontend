'use client';

import { useAuth } from "@/features/auth/context/AuthContext";
import { useGetEmployee } from "@/features/employee/hooks";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, UserRound } from "lucide-react";
import { ProfileInfoCard } from "./profile-info-card";
import { ProfileEditForm } from "./profile-edit-form";
import { ChangePasswordSection } from "./change-password-section";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const employeeId = user?.employeeId;

  const { data: employee, isLoading } = useGetEmployee(employeeId ?? 0);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h2 className="text-2xl font-bold text-foreground">Cá nhân</h2>

      <ProfileInfoCard phone={user.phone} role={user.role} employee={employee} />

      {!employeeId ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <UserRound className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Chưa liên kết hồ sơ nhân viên</h3>
          <p className="text-muted-foreground">
            Tài khoản của bạn chưa được liên kết với hồ sơ nhân viên nên chưa thể cập nhật thông tin cá nhân.
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : employee ? (
        <ProfileEditForm employee={employee} />
      ) : null}

      <ChangePasswordSection />

      <Button variant="outline" className="w-fit" onClick={handleLogout}>
        <LogOut />
        Đăng xuất
      </Button>
    </div>
  );
}
