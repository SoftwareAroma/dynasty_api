/*
  Warnings:

  - Added the required column `currency` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "currency" TEXT NOT NULL;
