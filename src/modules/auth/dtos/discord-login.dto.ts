/* eslint-disable @typescript-eslint/naming-convention */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class DiscordLoginDto {
  @ApiProperty({
    description: 'The URL to redirect to after successfully logging in.',
  })
  @IsUrl({
    require_tld: false,
    require_protocol: true,
  })
  @IsNotEmpty()
  public successRedirectUrl: string;

  @ApiProperty({
    description: 'The URL to redirect to after failing to log in.',
  })
  @IsUrl({
    require_tld: false,
    require_protocol: true,
  })
  @IsNotEmpty()
  public failRedirectUrl: string;
}
