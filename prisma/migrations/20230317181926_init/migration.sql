/*
  Warnings:

  - Added the required column `designation` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "designation" TEXT NOT NULL;
