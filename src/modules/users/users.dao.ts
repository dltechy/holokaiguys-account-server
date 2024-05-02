import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaError } from 'prisma-error-enum';

import { QueryConfig } from '@app/config/interfaces/query.config';
import { SortOrder } from '@app/constants/pagination.constants';
import { PrismaService } from '@app/providers/prisma/prisma.service';

import { CreateUserDto } from './dtos/create-user.dto';
import { GetUsersQueryDto, GetUsersSortBy } from './dtos/get-users.dto';
import { UpdateUserDiscordInfoDto } from './dtos/update-user-discord-info.dto';
import { UpdateUserSuperAdminStateDto } from './dtos/update-user-super-admin-state.dto';
import { User } from './schemas/user';

@Injectable()
export class UsersDao {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  private convertDbUserToObject(user: {
    id: string;
    isSuperAdmin: boolean;
    discordId: string;
    discordUsername: string;
    discordDisplayName: string;
    discordAvatarHash?: string;
    discordAvatarFilename?: string;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return {
      id: user.id,
      isSuperAdmin: user.isSuperAdmin,
      discord: {
        id: user.discordId,
        username: user.discordUsername,
        displayName: user.discordDisplayName,
        avatarHash: user.discordAvatarHash ?? null,
        avatarFilename: user.discordAvatarFilename ?? null,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  public async create(dto: CreateUserDto): Promise<User> {
    try {
      const user = await this.prismaService.user.create({
        data: {
          isSuperAdmin: dto.isSuperAdmin,
          discordId: dto.discord.id,
          discordUsername: dto.discord.username,
          discordDisplayName: dto.discord.displayName,
          discordAvatarHash: dto.discord.avatarHash,
          discordAvatarFilename: dto.discord.avatarFilename,
        },
      });

      return this.convertDbUserToObject(user);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === PrismaError.UniqueConstraintViolation) {
          throw new ConflictException('Discord ID/username is already in use.');
        }
      }

      throw e;
    }
  }

  public async getMany(dto: GetUsersQueryDto): Promise<{
    totalCount: number;
    users: User[];
  }> {
    const {
      isSuperAdmin,
      discordUsername,
      discordDisplayName,
      page = 1,
      count = this.configService.get<QueryConfig>('query').maxResponseCount,
      sortBy = GetUsersSortBy.CreatedAt,
    } = dto;

    const searchFilter: Prisma.UserWhereInput = {};
    if (isSuperAdmin != null) {
      searchFilter.isSuperAdmin = isSuperAdmin;
    }
    if (discordUsername != null) {
      searchFilter.discordUsername = {
        contains: discordUsername,
        mode: 'insensitive',
      };
    }
    if (discordDisplayName != null) {
      searchFilter.discordDisplayName = {
        contains: discordDisplayName,
        mode: 'insensitive',
      };
    }

    let sortOrder: Prisma.SortOrder;
    switch (dto.sortOrder) {
      case SortOrder.Desc:
        sortOrder = 'desc';
        break;
      default:
        sortOrder = 'asc';
        break;
    }

    let orderBy: Prisma.Enumerable<Prisma.UserOrderByWithRelationInput>;
    switch (sortBy) {
      case GetUsersSortBy.DiscordUsername:
        orderBy = {
          [sortBy]: sortOrder,
        };
        break;
      default:
        orderBy = [
          {
            [sortBy]: sortOrder,
          },
          {
            [GetUsersSortBy.DiscordUsername]: 'asc',
          },
        ];
        break;
    }

    const [totalCount, users] = await this.prismaService.$transaction([
      this.prismaService.user.count({
        where: searchFilter,
      }),
      this.prismaService.user.findMany({
        where: searchFilter,
        skip: (page - 1) * count,
        take: count,
        orderBy,
      }),
    ]);

    return {
      totalCount,
      users: users.map(this.convertDbUserToObject),
    };
  }

  public async getById(id: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (user == null) {
      return null;
    }

    return this.convertDbUserToObject(user);
  }

  public async getByDiscordId(discordId: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: {
        discordId,
      },
    });

    if (user == null) {
      return null;
    }

    return this.convertDbUserToObject(user);
  }

  public async getByDiscordUsername(discordUsername: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: {
        discordUsername,
      },
    });

    if (user == null) {
      return null;
    }

    return this.convertDbUserToObject(user);
  }

  public async updateSuperAdminState(
    id: string,
    dto: UpdateUserSuperAdminStateDto,
  ): Promise<User> {
    try {
      const user = await this.prismaService.user.update({
        where: {
          id,
        },
        data: dto,
      });

      return this.convertDbUserToObject(user);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === PrismaError.RecordsNotFound) {
          throw new NotFoundException('User not found.');
        }
      }

      throw e;
    }
  }

  public async updateDiscordInfo(
    id: string,
    dto: UpdateUserDiscordInfoDto,
  ): Promise<User> {
    try {
      const user = await this.prismaService.user.update({
        where: {
          id,
        },
        data: {
          discordUsername: dto.username,
          discordDisplayName: dto.displayName,
          discordAvatarHash: dto.avatarHash,
          discordAvatarFilename: dto.avatarFilename,
        },
      });

      return this.convertDbUserToObject(user);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === PrismaError.UniqueConstraintViolation) {
          throw new ConflictException('Discord username already taken.');
        } else if (e.code === PrismaError.RecordsNotFound) {
          throw new NotFoundException('User not found.');
        }
      }

      throw e;
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      await this.prismaService.user.delete({
        where: {
          id,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === PrismaError.RecordsNotFound) {
          throw new NotFoundException('User not found.');
        }
      }

      throw e;
    }
  }
}
