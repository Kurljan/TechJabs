"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProducts(search?: string) {
  const data = await prisma.inventory.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { sku: { contains: search } },
            { category: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });
  return JSON.parse(JSON.stringify(data));
}

export async function addProduct(data: {
  name: string;
  sku: string;
  category: string;
  stockCount: number;
  price: number;
}) {
  try {
    await prisma.inventory.create({ data });
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
  } catch (err: any) {
    console.error("addProduct error:", err);
    if (err?.code === "P2002") return { error: "A product with this SKU already exists." };
    return { error: err?.message || "Failed to add product" };
  }
}

export async function updateProduct(
  id: string,
  data: { name: string; sku: string; category: string; stockCount: number; price: number }
) {
  try {
    await prisma.inventory.update({ where: { id }, data });
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
  } catch (err: any) {
    console.error("updateProduct error:", err);
    if (err?.code === "P2002") return { error: "A product with this SKU already exists." };
    return { error: err?.message || "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    // Delete related records first
    await prisma.saleItem.deleteMany({ where: { inventoryId: id } });
    await prisma.warranty.deleteMany({ where: { inventoryId: id } });
    await prisma.purchase.deleteMany({ where: { inventoryId: id } });
    await prisma.inventory.delete({ where: { id } });
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
  } catch (err: any) {
    return { error: err.message || "Failed to delete product" };
  }
}

export async function getInventoryMetrics() {
  const items = await prisma.inventory.findMany({
    select: { price: true, stockCount: true },
  });
  const totalProducts = items.length;
  const totalValue = items.reduce((sum, i) => sum + i.price * i.stockCount, 0);
  const lowStockItems = items.filter((i) => i.stockCount < 5).length;
  return { totalProducts, totalValue, lowStockItems };
}
