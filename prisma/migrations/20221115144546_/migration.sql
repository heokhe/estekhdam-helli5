/*
  Warnings:

  - Added the required column `lastName` to the `Applicant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "CategoryData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "requiresCV" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "Question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "categoryDataId" INTEGER,
    CONSTRAINT "Question_categoryDataId_fkey" FOREIGN KEY ("categoryDataId") REFERENCES "CategoryData" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Applicant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL
);
INSERT INTO "new_Applicant" ("email", "id", "name") SELECT "email", "id", "name" FROM "Applicant";
DROP TABLE "Applicant";
ALTER TABLE "new_Applicant" RENAME TO "Applicant";
CREATE UNIQUE INDEX "Applicant_email_key" ON "Applicant"("email");
CREATE TABLE "new_Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "parentId" INTEGER,
    "categoryDataId" INTEGER,
    CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Category_categoryDataId_fkey" FOREIGN KEY ("categoryDataId") REFERENCES "CategoryData" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Category" ("id", "parentId", "title") SELECT "id", "parentId", "title" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
