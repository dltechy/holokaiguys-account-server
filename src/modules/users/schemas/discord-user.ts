import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DiscordUser {
  @ApiProperty({ description: 'The Discord ID of the user.' })
  public id: string;

  @ApiProperty({ description: 'The Discord username of the user.' })
  public username: string;

  @ApiProperty({ description: 'The Discord display name of the user.' })
  public displayName: string;

  @ApiProperty({
    description: 'The hash of the Discord avatar of the user.',
  })
  @ApiPropertyOptional()
  public avatarHash?: string;

  @ApiProperty({
    description:
      'The filename of the Discord avatar of the user. You can access the actual file by using the relative URL: "/public/avatars/<filename>.(png|gif)"',
  })
  @ApiPropertyOptional()
  public avatarFilename?: string;
}
