import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserDiscordIdParamDto {
  @ApiProperty({ description: 'The Discord ID of the user.' })
  @IsString()
  @IsNotEmpty()
  public discordId: string;
}
