"use server";

import prisma from "@/lib/prisma";

export async function getInventoryMetrics() {
  const totalProducts = await prisma.inventory.count();
  
  const totalValueResult = await prisma.inventory.aggregate({
    _sum: {
      price: true, // This assumes stockCount is also considered, let's simplify for now or calculate properly
    }
  });

  // Calculate total value (price * stockCount)
  const items = await prisma.inventory.findMany({
    select: { price: true, stockCount: true }
  });
  
  const totalValue = items.reduce(
    (sum: number, item: { price: any, stockCount: number }) => sum + Number(item.price) * item.stockCount, 
    0
  );

  const lowStockItems = await prisma.inventory.count({
    where: { stockCount: { lt: 5 } }
  });

  return { totalProducts, totalValue, lowStockItems };
}

export async function getSalesMetrics() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: sevenDaysAgo } }
  });

  const totalRevenue = sales.reduce((sum: number, sale: { totalAmount: any }) => sum + Number(sale.totalAmount), 0);
  const transactions = sales.length;
  const averageOrder = transactions > 0 ? totalRevenue / transactions : 0;

  return { totalRevenue, transactions, averageOrder };
}

export async function getWarrantyMetrics() {
  const activeWarranties = await prisma.warranty.count({
    where: { expirationDate: { gte: new Date() } }
  });

  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

  const expiringSoon = await prisma.warranty.count({
    where: { 
      expirationDate: { 
        gte: new Date(),
        lte: ninetyDaysFromNow 
      } 
    }
  });

  const expired = await prisma.warranty.count({
    where: { expirationDate: { lt: new Date() } }
  });

  return { activeWarranties, expiringSoon, expired };
}
