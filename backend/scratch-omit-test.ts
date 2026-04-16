import { PrismaClient } from '@prisma/client';
import "dotenv/config";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  omit: {
    user: {
      password: true,
    },
  },
});

async function main() {
  const user = await prisma.user.findFirst({
    // If we want password we could do omit: { password: false } perhaps?
    // Let's test if omit: { password: false } works.
  });
  console.log("Without password:", user);

  // Let's see how we can get password
  const userWithPassword = await prisma.user.findFirst({
    include: { team: true },
    omit: { password: false } as any // testing if this works
  });
  console.log("With password (omit false):", userWithPassword);
}

main().catch(console.error).finally(() => prisma.$disconnect());
