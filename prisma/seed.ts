/**
 * Seed script — creates an OWNER user for local development.
 *
 * Run: npx prisma db seed
 * Requires DATABASE_URL in .env
 *
 * Default credentials:
 *   Email:    owner@pharmacy.local
 *   Password: owner123 (change in production!)
 *   Role:     OWNER
 */

import "dotenv/config";
import { PrismaClient, UserRole } from "@/generated/prisma";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Check if owner already exists
  const existing = await prisma.user.findUnique({
    where: { email: "owner@pharmacy.local" },
  });

  if (existing) {
    console.log("✅ Owner user already exists, skipping.");
    await prisma.$disconnect();
    return;
  }

  // Create owner user
  const owner = await prisma.user.create({
    data: {
      name: "مدير النظام",
      email: "owner@pharmacy.local",
      passwordHash: hashSync("owner123", 10),
      role: UserRole.OWNER,
      isActive: true,
    },
  });

  console.log(`✅ Created OWNER user:`);
  console.log(`   ID:    ${owner.id}`);
  console.log(`   Email: ${owner.email}`);
  console.log(`   Role:  ${owner.role}`);
  console.log("");
  console.log("⚠️  Change the password after first login!");
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });