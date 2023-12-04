/*
  Warnings:

  - You are about to drop the column `quantity` on the `Sale` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_saleId_fkey";

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "saleId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "quantity",
ALTER COLUMN "amount" SET DEFAULT 0.0,
ALTER COLUMN "currency" SET DEFAULT 'GH₵';

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;
