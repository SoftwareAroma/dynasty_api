/*
  Warnings:

  - You are about to drop the column `productId` on the `Sale` table. All the data in the column will be lost.
  - Added the required column `saleId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_productId_fkey";

-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "avatar" SET DEFAULT 'https://res.cloudinary.com/dynasty-urban-style/image/upload/v1701686160/defaults/account_afhqmj.png';

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "avatar" SET DEFAULT 'https://res.cloudinary.com/dynasty-urban-style/image/upload/v1701686160/defaults/account_afhqmj.png';

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "avatar" SET DEFAULT 'https://res.cloudinary.com/dynasty-urban-style/image/upload/v1701686160/defaults/account_afhqmj.png';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "saleId" TEXT NOT NULL,
ALTER COLUMN "images" SET DEFAULT ARRAY['https://res.cloudinary.com/dynasty-urban-style/image/upload/v1701686619/defaults/placeholder_image_resized_vf7n7a.jpg']::TEXT[];

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "productId";

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
