/*
  Warnings:

  - You are about to drop the `Price` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `price` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Price" DROP CONSTRAINT "Price_priceId_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "price" JSONB NOT NULL,
ALTER COLUMN "brand" SET DEFAULT 'Custom',
ALTER COLUMN "rating" SET DEFAULT 0,
ALTER COLUMN "numReviews" SET DEFAULT 0;

-- DropTable
DROP TABLE "Price";
