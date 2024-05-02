import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UserIdParamDto {
  @ApiProperty({
    description: 'The ID of the user.',
    type: String,
    format: 'uuid',
  })
  @IsUUID(4)
  public id: string;
}
