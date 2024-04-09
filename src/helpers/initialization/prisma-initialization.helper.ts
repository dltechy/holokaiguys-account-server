import { INestApplication } from '@nestjs/common';

import { PrismaService } from '@app/providers/prisma/prisma.service';

export async function initializePrisma(app: INestApplication): Promise<void> {
  const prismaService = app.get(PrismaService);

  await prismaService.enableShutdownHooks(app);
}
