'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { selfUpdateEmployeeSchema } from "@/features/employee/schemas/employee.schema";
import { SelfUpdateEmployeeDTO } from "@/features/employee/types";
import { useUpdateMyProfile } from "@/features/employee/hooks";
import { Employee } from "@/features/employee/types";

type ProfileEditFormProps = {
  employee: Employee;
};

export function ProfileEditForm({ employee }: ProfileEditFormProps) {
  const form = useForm<SelfUpdateEmployeeDTO>({
    resolver: zodResolver(selfUpdateEmployeeSchema),
    values: {
      phoneNumber: employee.phoneNumber,
      email: employee.email ?? "",
      address: employee.address ?? "",
    },
  });

  const { mutate: updateMyProfile, isPending } = useUpdateMyProfile(form);

  const onSubmit = (data: SelfUpdateEmployeeDTO) => {
    updateMyProfile(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cập nhật thông tin</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input placeholder="0987654321" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="ban@example.com" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl>
                    <Input placeholder="Địa chỉ của bạn" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-fit">
              {isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
