/*
  Warnings:

  - You are about to drop the column `saleId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `Sale` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_saleId_fkey";

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_employeeId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "saleId";

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "employeeId";
