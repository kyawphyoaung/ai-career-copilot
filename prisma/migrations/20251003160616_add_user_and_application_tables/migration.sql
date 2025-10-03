-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED');

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "linkedinUrl" TEXT NOT NULL,
    "githubUrl" TEXT NOT NULL,
    "education" JSONB NOT NULL,
    "leadership" JSONB NOT NULL,
    "masterSkills" JSONB NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "country" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "contactEmail" TEXT,
    "followUp" BOOLEAN NOT NULL DEFAULT false,
    "skillMatchPercentage" DOUBLE PRECISION,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "statusUpdatedAt" TIMESTAMP(3),
    "jobDescription" TEXT NOT NULL,
    "generatedCvJson" JSONB NOT NULL,
    "cvPdfFilename" TEXT NOT NULL,
    "cvThemeUsed" TEXT NOT NULL,
    "generatedCoverLetterJson" JSONB,
    "cvCoverLetterPdfFilename" TEXT,
    "userProfileId" INTEGER NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
