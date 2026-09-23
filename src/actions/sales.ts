"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface SaleItemInput {
  inventoryId: string;
  quantity: number;
  price: number;
}

export async function getSales() {
  const data = await prisma.sale.findMany({
    include: {
      saleItems: { include: { inventory: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  return JSON.parse(JSON.stringify(data));
}

export async function addSale(data: {
  customerName?: string;
  notes?: string;
  items: SaleItemInput[];
}) {
  const totalAmount = data.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  try {
    // Create sale + items in a transaction, decrement stock
    await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          customerName: data.customerName,
          notes: data.notes,
          totalAmount,
          saleItems: {
            create: data.items.map((item) => ({
              inventoryId: item.inventoryId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      // Decrement stock for each item
      for (const item of data.items) {
        await tx.inventory.update({
          where: { id: item.inventoryId },
          data: { stockCount: { decrement: item.quantity } },
        });
      }

      return sale;
    });

    revalidatePath("/sales");
    revalidatePath("/inventory");
    revalidatePath("/receipts");
    revalidatePath("/dashboard");
  } catch (err: any) {
    return { error: err.message || "Failed to add sale" };
  }
}

export async function getSalesMetrics() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
  });

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const transactions = sales.length;
  const averageOrder = transactions > 0 ? totalRevenue / transactions : 0;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todaySales = await prisma.sale.findMany({
    where: { createdAt: { gte: todayStart } },
  });
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);

  return { totalRevenue, transactions, averageOrder, todayRevenue };
}
