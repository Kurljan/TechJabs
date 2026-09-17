"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPurchases() {
  return prisma.purchase.findMany({
    include: { inventory: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function addPurchase(data: {
  supplier: string;
  inventoryId: string;
  quantity: number;
  unitCost: number;
  notes?: string;
}) {
  await prisma.$transaction(async (tx) => {
    await tx.purchase.create({ data });
    // Auto-increment stock
    await tx.inventory.update({
      where: { id: data.inventoryId },
      data: { stockCount: { increment: data.quantity } },
    });
  });

  revalidatePath("/purchases");
  revalidatePath("/inventory");
}

export async function deletePurchase(id: string) {
  await prisma.purchase.delete({ where: { id } });
  revalidatePath("/purchases");
}
