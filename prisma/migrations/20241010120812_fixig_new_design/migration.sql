-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_levelName_fkey" FOREIGN KEY ("levelName") REFERENCES "Level"("id_name") ON DELETE CASCADE ON UPDATE CASCADE;
