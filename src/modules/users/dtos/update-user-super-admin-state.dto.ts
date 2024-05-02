import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateUserSuperAdminStateDto {
  @ApiProperty({
    description:
      'The flag that determines if the user is a super admin or not.',
  })
  @IsBoolean()
  public isSuperAdmin: boolean;
}
