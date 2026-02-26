"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { caseFileSchema } from "@/lib/schemas";

export async function getCaseFile(id: string) {
  return prisma.caseFile.findUnique({
    where: { id },
    include: { customer: true },
  });
}

export async function createCaseFile(customerId: string, formData: FormData) {
  const raw = {
    title: formData.get("title") as string,
    contractDate: formData.get("contractDate") as string,
    initialValue: formData.get("initialValue") as string,
    indexKey: (formData.get("indexKey") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = caseFileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  await prisma.caseFile.create({
    data: {
      customerId,
      title: parsed.data.title,
      contractDate: new Date(parsed.data.contractDate),
      initialValue: parsed.data.initialValue,
      indexKey: parsed.data.indexKey || null,
      notes: parsed.data.notes ?? null,
    },
  });

  revalidatePath(`/customers/${customerId}`);
  return { success: true };
}

export async function updateCaseFile(
  id: string,
  customerId: string,
  formData: FormData
) {
  const raw = {
    title: formData.get("title") as string,
    contractDate: formData.get("contractDate") as string,
    initialValue: formData.get("initialValue") as string,
    indexKey: (formData.get("indexKey") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = caseFileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  await prisma.caseFile.update({
    where: { id },
    data: {
      title: parsed.data.title,
      contractDate: new Date(parsed.data.contractDate),
      initialValue: parsed.data.initialValue,
      indexKey: parsed.data.indexKey || null,
      notes: parsed.data.notes ?? null,
    },
  });

  revalidatePath(`/customers/${customerId}`);
  revalidatePath(`/customers/${customerId}/cases/${id}`);
  return { success: true };
}

export async function deleteCaseFile(id: string, customerId: string) {
  await prisma.caseFile.delete({ where: { id } });
  revalidatePath(`/customers/${customerId}`);
  return { success: true };
}
