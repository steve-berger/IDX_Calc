/*
  Warnings:

  - You are about to drop the column `contractDate` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `contractDate` to the `CaseFile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "VpiDataPoint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "indexKey" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "value" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "VpiSyncLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "indexKey" TEXT NOT NULL,
    "syncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rowCount" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CaseFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contractDate" DATETIME NOT NULL,
    "initialValue" REAL NOT NULL,
    "indexKey" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CaseFile_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CaseFile" ("createdAt", "customerId", "id", "indexKey", "initialValue", "notes", "title", "updatedAt") SELECT "createdAt", "customerId", "id", "indexKey", "initialValue", "notes", "title", "updatedAt" FROM "CaseFile";
DROP TABLE "CaseFile";
ALTER TABLE "new_CaseFile" RENAME TO "CaseFile";
CREATE INDEX "CaseFile_customerId_idx" ON "CaseFile"("customerId");
CREATE TABLE "new_Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "defaultIndexKey" TEXT NOT NULL DEFAULT 'VPI_2020',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Customer" ("createdAt", "defaultIndexKey", "id", "name", "notes", "updatedAt") SELECT "createdAt", "defaultIndexKey", "id", "name", "notes", "updatedAt" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "VpiDataPoint_indexKey_idx" ON "VpiDataPoint"("indexKey");

-- CreateIndex
CREATE UNIQUE INDEX "VpiDataPoint_indexKey_period_key" ON "VpiDataPoint"("indexKey", "period");

-- CreateIndex
CREATE INDEX "VpiSyncLog_indexKey_idx" ON "VpiSyncLog"("indexKey");
