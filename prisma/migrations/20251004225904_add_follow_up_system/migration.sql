-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "followUpCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "followUpDate" TIMESTAMP(3);
