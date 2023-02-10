/*
  Warnings:

  - Added the required column `birthDate` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT,
    "marriageStatus" INTEGER NOT NULL,
    "recruitmentType" INTEGER NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "imageAddress" TEXT NOT NULL,
    "cvAddress" TEXT,
    CONSTRAINT "Application_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Application" ("categoryId", "cvAddress", "email", "id", "imageAddress", "lastName", "marriageStatus", "name", "phoneNumber", "recruitmentType", "time") SELECT "categoryId", "cvAddress", "email", "id", "imageAddress", "lastName", "marriageStatus", "name", "phoneNumber", "recruitmentType", "time" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
