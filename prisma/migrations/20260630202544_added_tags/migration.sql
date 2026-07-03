/*
  Warnings:

  - You are about to drop the column `tags` on the `Tea` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tea" DROP COLUMN "tags";

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TagToTea" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TagToTea_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "_TagToTea_B_index" ON "_TagToTea"("B");

-- AddForeignKey
ALTER TABLE "_TagToTea" ADD CONSTRAINT "_TagToTea_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToTea" ADD CONSTRAINT "_TagToTea_B_fkey" FOREIGN KEY ("B") REFERENCES "Tea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
