-- CreateTable
CREATE TABLE "ImportState" (
    "id" TEXT NOT NULL,
    "currentIndex" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportState_pkey" PRIMARY KEY ("id")
);
