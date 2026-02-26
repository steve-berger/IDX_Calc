"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { customerSchema } from "@/lib/schemas";

const PAGE_SIZE = 10;

export async function getCustomers(search?: string, page = 1) {
  const where = search
    ? { name: { contains: search } }
    : {};
  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { name: "asc" },
      include: { _count: { select: { caseFiles: true } } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.customer.count({ where }),
  ]);
  return { customers, total, page, pageSize: PAGE_SIZE, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export async function getCustomer(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      caseFiles: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function createCustomer(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    defaultIndexKey: formData.get("defaultIndexKey") as string,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  await prisma.customer.create({
    data: {
      name: parsed.data.name,
      defaultIndexKey: parsed.data.defaultIndexKey,
      notes: parsed.data.notes ?? null,
    },
  });

  revalidatePath("/customers");
  return { success: true };
}

export async function updateCustomer(id: string, formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    defaultIndexKey: formData.get("defaultIndexKey") as string,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  await prisma.customer.update({
    where: { id },
    data: {
      name: parsed.data.name,
      defaultIndexKey: parsed.data.defaultIndexKey,
      notes: parsed.data.notes ?? null,
    },
  });

  revalidatePath(`/customers/${id}`);
  revalidatePath("/customers");
  return { success: true };
}

export async function deleteCustomer(id: string) {
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
  return { success: true };
}
