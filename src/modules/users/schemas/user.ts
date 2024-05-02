import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { DiscordUser } from './discord-user';

export class User {
  @ApiProperty({
    description: 'The ID of the user.',
    type: String,
    format: 'uuid',
  })
  @ApiPropertyOptional()
  public id: string;

  @ApiProperty({
    description:
      'The flag that determines if the user is a super admin or not.',
  })
  public isSuperAdmin: boolean;

  @ApiProperty({
    description: 'The Discord information of the user.',
    type: DiscordUser,
  })
  public discord: DiscordUser;

  @ApiProperty({ description: 'The date-time when the user was created.' })
  public createdAt: Date;

  @ApiProperty({ description: 'The date-time when the user was last updated.' })
  public updatedAt: Date;
}
