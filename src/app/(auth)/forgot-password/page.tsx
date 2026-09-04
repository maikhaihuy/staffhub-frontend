'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Quên mật khẩu</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Tính năng khôi phục mật khẩu chưa sẵn sàng. Vui lòng liên hệ quản lý
            để được cấp lại mật khẩu.
          </p>
          <Button asChild>
            <Link href="/login">Quay lại đăng nhập</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
