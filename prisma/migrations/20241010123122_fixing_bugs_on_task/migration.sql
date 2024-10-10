/*
  Warnings:

  - A unique constraint covering the columns `[userId,levelName]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "description" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_userId_levelName_key" ON "Order"("userId", "levelName");
