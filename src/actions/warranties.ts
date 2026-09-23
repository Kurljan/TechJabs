"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getWarranties() {
  const data = await prisma.warranty.findMany({
    include: { inventory: { select: { name: true } } },
    orderBy: { expirationDate: "asc" },
  });
  return JSON.parse(JSON.stringify(data));
}

export async function addWarranty(data: {
  serialNumber: string;
  inventoryId: string;
  customerName?: string;
  expirationDate: string;
}) {
  try {
    await prisma.warranty.create({
      data: {
        ...data,
        expirationDate: new Date(data.expirationDate),
      },
    });
    revalidatePath("/warranties");
    revalidatePath("/dashboard");
  } catch (err: any) {
    if (err.code === "P2002") return { error: "A warranty with this serial number already exists." };
    return { error: err.message || "Failed to add warranty" };
  }
}

export async function deleteWarranty(id: string) {
  try {
    await prisma.warranty.delete({ where: { id } });
    revalidatePath("/warranties");
    revalidatePath("/dashboard");
  } catch (err: any) {
    return { error: err.message || "Failed to delete warranty" };
  }
}

export async function getWarrantyMetrics() {
  const now = new Date();
  const ninetyDays = new Date();
  ninetyDays.setDate(ninetyDays.getDate() + 90);

  const [activeWarranties, expiringSoon, expired] = await Promise.all([
    prisma.warranty.count({ where: { expirationDate: { gte: now } } }),
    prisma.warranty.count({ where: { expirationDate: { gte: now, lte: ninetyDays } } }),
    prisma.warranty.count({ where: { expirationDate: { lt: now } } }),
  ]);

  return { activeWarranties, expiringSoon, expired };
}
