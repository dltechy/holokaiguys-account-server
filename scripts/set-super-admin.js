/* eslint-disable no-console */

require('dotenv').config();

const { NotFoundException } = require('@nestjs/common');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const discordUsername = process.argv[2];
  if (discordUsername == null) {
    console.log('Usage: "pnpm run script:setsuperadmin <discord username>"');
    process.exit(1);
  }

  await prisma.$transaction(async (transaction) => {
    const user = await transaction.user.findUnique({
      where: {
        discordUsername,
      },
    });

    if (user == null) {
      throw new NotFoundException('User not found.');
    }

    await transaction.user.update({
      where: {
        discordUsername,
      },
      data: {
        isSuperAdmin: true,
      },
    });
  });

  console.log('Super admin successfully set.');
  console.log(`  Discord username: ${discordUsername}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
