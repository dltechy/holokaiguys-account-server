import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { GetUsersQueryDto } from './dtos/get-users.dto';
import { UpdateUserSuperAdminStateDto } from './dtos/update-user-super-admin-state.dto';
import { User } from './schemas/user';
import { UsersDao } from './users.dao';

@Injectable()
export class UsersService {
  constructor(private readonly usersDao: UsersDao) {}

  public async getMany(dto: GetUsersQueryDto): Promise<{
    totalCount: number;
    users: User[];
  }> {
    return this.usersDao.getMany(dto);
  }

  private async get(user: User): Promise<User> {
    if (user == null) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  public async getById(id: string): Promise<User> {
    const user = await this.usersDao.getById(id);
    return this.get(user);
  }

  public async getByDiscordId(discordId: string): Promise<User> {
    const user = await this.usersDao.getByDiscordId(discordId);
    return this.get(user);
  }

  public async getByDiscordUsername(discordUsername: string): Promise<User> {
    const user = await this.usersDao.getByDiscordUsername(discordUsername);
    return this.get(user);
  }

  public async updateSuperAdminState(
    id: string,
    dto: UpdateUserSuperAdminStateDto,
  ): Promise<User> {
    const user = await this.usersDao.updateSuperAdminState(id, dto);
    return this.get(user);
  }

  public async delete(id: string, user: User): Promise<void> {
    if (!user.isSuperAdmin && user.id !== id) {
      throw new ForbiddenException();
    }

    return this.usersDao.delete(id);
  }
}
