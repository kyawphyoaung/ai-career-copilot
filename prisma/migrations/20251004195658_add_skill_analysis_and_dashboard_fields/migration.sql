-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "missingSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "requiredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[];
