-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CategoryData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "requiresCV" BOOLEAN DEFAULT true
);
INSERT INTO "new_CategoryData" ("id", "requiresCV") SELECT "id", "requiresCV" FROM "CategoryData";
DROP TABLE "CategoryData";
ALTER TABLE "new_CategoryData" RENAME TO "CategoryData";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
