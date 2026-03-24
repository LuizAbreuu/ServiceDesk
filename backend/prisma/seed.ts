import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@servicedesk.com' },
    update: {},
    create: {
      email: 'admin@servicedesk.com',
      name: 'System Admin',
      password: adminPassword,
      role: 'Admin'
    }
  });

  console.log({ admin });
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
