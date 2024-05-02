import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBooleanString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Validate,
} from 'class-validator';

import { SortOrder } from '@app/constants/pagination.constants';
import { ValidateMaxQueryCount } from '@app/helpers/validators/validate-max-query-count.helper';

export enum GetUsersSortBy {
  IsSuperAdmin = 'isSuperAdmin',
  DiscordUsername = 'discordUsername',
  DiscordDisplayName = 'discordDisplayName',
  CreatedAt = 'createdAt',
  UpdatedAt = 'updatedAt',
}

export class GetUsersQueryDto {
  @ApiProperty({
    description:
      'The boolean string used to search the users list by their super admin status.',
  })
  @ApiPropertyOptional()
  @IsBooleanString()
  @IsOptional()
  public isSuperAdmin?: boolean;

  @ApiProperty({
    description:
      'The string used to search the users list by their discord username.',
  })
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  public discordUsername?: string;

  @ApiProperty({
    description:
      'The string used to search the users list by their discord display name.',
  })
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  public discordDisplayName?: string;

  @ApiProperty({
    description: 'The page number of the users list.',
    minimum: 1,
  })
  @ApiPropertyOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @IsOptional()
  public page?: number;

  @ApiProperty({
    description: 'The maximum number of users in a page.',
    minimum: 1,
  })
  @ApiPropertyOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Validate(ValidateMaxQueryCount)
  @IsOptional()
  public count?: number;

  @ApiProperty({
    description: 'The field to sort the users by.',
    enum: GetUsersSortBy,
  })
  @ApiPropertyOptional()
  @IsEnum(GetUsersSortBy)
  @IsOptional()
  public sortBy?: GetUsersSortBy;

  @ApiProperty({
    description: 'The order to sort the users by.',
    enum: SortOrder,
  })
  @ApiPropertyOptional()
  @IsEnum(SortOrder)
  @IsOptional()
  public sortOrder?: SortOrder;
}
