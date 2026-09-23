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
  inventoryId?: string;
  newProduct?: { name: string; sku: string; category: string; price: number };
  quantity: number;
  unitCost: number;
  notes?: string;
}) {
  try {
    await prisma.$transaction(async (tx) => {
      let invId = data.inventoryId;
      if (data.newProduct) {
        const p = await tx.inventory.create({
          data: { ...data.newProduct, stockCount: 0 },
        });
        invId = p.id;
      }
      
      if (!invId) throw new Error("No inventory item specified.");

      await tx.purchase.create({ 
        data: {
          supplier: data.supplier,
          inventoryId: invId,
          quantity: data.quantity,
          unitCost: data.unitCost,
          notes: data.notes,
        }
      });
      // Auto-increment stock
      await tx.inventory.update({
        where: { id: invId },
        data: { stockCount: { increment: data.quantity } },
      });
    });

    revalidatePath("/purchases");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
  } catch (err: any) {
    if (err.code === "P2002") return { error: "A product with this SKU already exists." };
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
 * Returns inventory items eligible for warranty registration:
 * any item that has been transacted — either purchased from a supplier
 * OR sold to a customer. This prevents registering warranties for
 * phantom inventory that has never moved through the system.
 */
export async function getWarrantyEligibleProducts() {
  const data = await prisma.inventory.findMany({
    where: {
      OR: [
        { purchases: { some: {} } },   // received via Purchase Records
        { saleItems: { some: {} } },   // sold via Sales
      ],
    },
    select: { id: true, name: true, sku: true },
    orderBy: { name: "asc" },
  });
  return JSON.parse(JSON.stringify(data));
}

/** Products that have at least one purchase from a supplier — for Purchase Warranties. */
export async function getPurchaseProducts() {
  const data = await prisma.inventory.findMany({
    where: { purchases: { some: {} } },
    select: { id: true, name: true, sku: true },
    orderBy: { name: "asc" },
  });
  return JSON.parse(JSON.stringify(data));
}

/** Products that have been sold — for Sales Warranties. Returns a list of past sales with customer names. */
export async function getSaleProducts() {
  const data = await prisma.saleItem.findMany({
    include: {
      inventory: { select: { id: true, name: true, sku: true } },
      sale: { select: { customerName: true, createdAt: true } },
    },
    orderBy: { sale: { createdAt: "desc" } },
  });
  return JSON.parse(JSON.stringify(data));
}


