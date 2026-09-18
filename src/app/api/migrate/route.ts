import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "role" TEXT NOT NULL DEFAULT 'STAFF',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
      
      CREATE TABLE IF NOT EXISTS "Inventory" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "sku" TEXT NOT NULL,
          "category" TEXT NOT NULL,
          "stockCount" INTEGER NOT NULL DEFAULT 0,
          "price" DOUBLE PRECISION NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
      );
      
      CREATE TABLE IF NOT EXISTS "Warranty" (
          "id" TEXT NOT NULL,
          "serialNumber" TEXT NOT NULL,
          "inventoryId" TEXT NOT NULL,
          "customerName" TEXT,
          "expirationDate" TIMESTAMP(3) NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Warranty_pkey" PRIMARY KEY ("id")
      );
      
      CREATE TABLE IF NOT EXISTS "Sale" (
          "id" TEXT NOT NULL,
          "userId" TEXT,
          "customerName" TEXT,
          "totalAmount" DOUBLE PRECISION NOT NULL,
          "notes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
      );
      
      CREATE TABLE IF NOT EXISTS "SaleItem" (
          "id" TEXT NOT NULL,
          "saleId" TEXT NOT NULL,
          "inventoryId" TEXT NOT NULL,
          "quantity" INTEGER NOT NULL,
          "price" DOUBLE PRECISION NOT NULL,
          CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
      );
      
      CREATE TABLE IF NOT EXISTS "Purchase" (
          "id" TEXT NOT NULL,
          "supplier" TEXT NOT NULL,
          "inventoryId" TEXT NOT NULL,
          "quantity" INTEGER NOT NULL,
          "unitCost" DOUBLE PRECISION NOT NULL,
          "notes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
      );
    `);

    try { await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "User_email_key" ON "User"("email");`); } catch (e) {}
    try { await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "Inventory_sku_key" ON "Inventory"("sku");`); } catch (e) {}
    try { await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "Warranty_serialNumber_key" ON "Warranty"("serialNumber");`); } catch (e) {}
    
    // Add foreign keys (ignoring errors if they already exist)
    try { await prisma.$executeRawUnsafe(`ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;`); } catch(e) {}
    try { await prisma.$executeRawUnsafe(`ALTER TABLE "Sale" ADD CONSTRAINT "Sale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;`); } catch(e) {}
    try { await prisma.$executeRawUnsafe(`ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;`); } catch(e) {}
    try { await prisma.$executeRawUnsafe(`ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;`); } catch(e) {}
    try { await prisma.$executeRawUnsafe(`ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;`); } catch(e) {}

    return NextResponse.json({ success: true, message: "Tables created successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
