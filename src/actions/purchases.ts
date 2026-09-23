"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPurchases() {
  const data = await prisma.purchase.findMany({
    include: { inventory: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return JSON.parse(JSON.stringify(data));
}

export async function addPurchase(data: {
  supplier: string;
  inventoryId: string;
  quantity: number;
  unitCost: number;
  notes?: string;
}) {
  try {
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
    revalidatePath("/dashboard");
  } catch (err: any) {
    return { error: err.message || "Failed to add purchase" };
  }
}

export async function deletePurchase(id: string) {
  try {
    await prisma.purchase.delete({ where: { id } });
    revalidatePath("/purchases");
  } catch (err: any) {
    return { error: err.message || "Failed to delete purchase" };
  }
}

/**
 * Returns only inventory items that have at least one purchase record.
 * Used in the warranty form to prevent registering a warranty for items
 * that have never been purchased.
 */
export async function getPurchasedProducts() {
  const data = await prisma.inventory.findMany({
    where: {
      purchases: { some: {} },
    },
    select: { id: true, name: true, sku: true },
    orderBy: { name: "asc" },
  });
  return JSON.parse(JSON.stringify(data));
}

