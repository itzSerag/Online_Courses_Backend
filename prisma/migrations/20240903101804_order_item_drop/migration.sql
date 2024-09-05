/*
  Warnings:

  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[amountCents]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,amountCents]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `itemName` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "itemName" "Level_Name" NOT NULL;

-- DropTable
DROP TABLE "OrderItem";

-- CreateIndex
CREATE UNIQUE INDEX "Order_amountCents_key" ON "Order"("amountCents");

-- CreateIndex
CREATE UNIQUE INDEX "Order_userId_amountCents_key" ON "Order"("userId", "amountCents");
