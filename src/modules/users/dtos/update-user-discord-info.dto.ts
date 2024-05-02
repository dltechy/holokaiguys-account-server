import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDiscordInfoDto {
  @ApiProperty({ description: 'The Discord username of the user.' })
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  public username?: string;

  @ApiProperty({ description: 'The Discord display name of the user.' })
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  public displayName?: string;

  @ApiProperty({
    description: 'The hash of the Discord avatar of the user.',
  })
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  public avatarHash?: string;

  @ApiProperty({
    description: 'The filename of the Discord avatar of the user.',
  })
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  public avatarFilename?: string;
}
