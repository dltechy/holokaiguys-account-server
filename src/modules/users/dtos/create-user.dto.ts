import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

import { CreateUserDiscordInfoDto } from './create-user-discord-info.dto';

export class CreateUserDto {
  @ApiProperty({
    description:
      'The flag that determines if the user is a super admin or not.',
  })
  @IsBoolean()
  public isSuperAdmin: boolean;

  @ApiProperty({
    description: 'The Discord information of the user.',
    type: CreateUserDiscordInfoDto,
  })
  public discord: CreateUserDiscordInfoDto;
}
