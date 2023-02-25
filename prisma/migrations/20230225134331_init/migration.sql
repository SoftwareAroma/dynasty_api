/*
  Warnings:

  - You are about to drop the column `customerId` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_customerId_fkey";

-- DropIndex
DROP INDEX "Product_customerId_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "customerId";
