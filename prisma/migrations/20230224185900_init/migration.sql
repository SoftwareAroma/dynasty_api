-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT,
    "phone" TEXT,
    "avatar" TEXT DEFAULT 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
    "salt" TEXT,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "isAdmin" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "social" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "salt" TEXT,
    "avatar" TEXT DEFAULT 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "class" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "rating" INTEGER,
    "customerId" TEXT NOT NULL,
    "numReviews" INTEGER,
    "numInStock" INTEGER,
    "colors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sizes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" TEXT NOT NULL,
    "priceId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_id_key" ON "Admin"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_id_key" ON "Customer"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_social_key" ON "Customer"("social");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_id_key" ON "Product"("id");

-- CreateIndex
CREATE INDEX "Product_customerId_idx" ON "Product"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Price_id_key" ON "Price"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Price_priceId_key" ON "Price"("priceId");

-- CreateIndex
CREATE INDEX "Price_priceId_idx" ON "Price"("priceId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
