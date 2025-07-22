// lib/prisma-wrapper.ts
export function withAudit<T>(
  userId: number,
  data: T,
  type: "create" | "update"
): T {
  const now = new Date();
  if (type === "create") {
    return {
      ...data,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
    };
  } else {
    return {
      ...data,
      updatedAt: now,
      updatedBy: userId,
    };
  }
}
