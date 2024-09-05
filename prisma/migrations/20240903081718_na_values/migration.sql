/*
  Warnings:

  - A unique constraint covering the columns `[paymentId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "phoneNumber" SET DEFAULT 'NA',
ALTER COLUMN "city" SET DEFAULT 'NA',
ALTER COLUMN "country" SET DEFAULT 'NA';

-- CreateIndex
CREATE UNIQUE INDEX "Order_paymentId_key" ON "Order"("paymentId");
