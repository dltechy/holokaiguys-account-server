import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TokenDto {
  @ApiProperty({
    description: 'The authorization code used to retrieve the token.',
  })
  @IsString()
  @IsNotEmpty()
  public code: string;
}
