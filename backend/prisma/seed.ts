import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

  // Times/Setores solicitados
  const teamsData = [
    { name: 'TI' },
    { name: 'Manutenção' },
    { name: 'Escola de equitação/Administração' },
    { name: 'Secretaria administrativa' },
    { name: 'Facilities' },
    { name: 'Marketing' },
    { name: 'RH' },
    { name: 'Segurança' },
    { name: 'Vila hípica' },
    { name: 'Secretaria de esportes' },
    { name: 'Eventos' },
    { name: 'Financeiro' },
    { name: 'Juridico' },
    { name: 'Compras' },
    { name: 'Sede' },
    { name: 'Restaurante' },
    { name: 'Almoxarifado central' },
    { name: 'Almoxarifado restaurante' },
    { name: 'Academia' },
  ];

  console.log('Inserindo times (se não existirem)...');
  for (const t of teamsData) {
    // Usamos create ou ignoramos se houver duplicado, mas como team não tem unique constraints além de ID,
    // o seed do Prisma geralmente precisa limpar ou usar findFirst para evitar múltiplas inserções se rodado várias vezes.
    // Vamos usar findFirst para verificar se já existe.
    const existing = await prisma.team.findFirst({ where: { name: t.name } });
    if (!existing) {
      await prisma.team.create({ data: t });
    }
  }
  console.log('Times inseridos com sucesso!');
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
