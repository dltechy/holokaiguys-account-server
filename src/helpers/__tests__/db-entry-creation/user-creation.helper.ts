import { User } from '@prisma/client';

import { usersSamples } from '@app/modules/users/__tests__/samples/users.samples';
import { PrismaService } from '@app/providers/prisma/prisma.service';

export async function createUserDbEntry(
  prismaService: PrismaService,
  userSample: (typeof usersSamples)[0],
): Promise<User> {
  const { user, createModel } = userSample;

  return prismaService.user.create({
    data: {
      id: user.id,
      isSuperAdmin: createModel.isSuperAdmin,
      discordId: createModel.discord.id,
      discordUsername: createModel.discord.username,
      discordDisplayName: createModel.discord.displayName,
      discordAvatarHash: createModel.discord.avatarHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
}
