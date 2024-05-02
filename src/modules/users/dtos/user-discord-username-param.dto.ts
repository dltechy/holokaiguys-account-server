import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserDiscordUsernameParamDto {
  @ApiProperty({ description: 'The Discord username of the user.' })
  @IsString()
  @IsNotEmpty()
  public discordUsername: string;
}
