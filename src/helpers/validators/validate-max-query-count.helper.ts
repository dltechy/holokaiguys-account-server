import { ConfigService } from '@nestjs/config';
import {
  max,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { QueryConfig } from '@app/config/interfaces/query.config';

@ValidatorConstraint({ async: true })
export class ValidateMaxQueryCount implements ValidatorConstraintInterface {
  private maxResponseCount: number;

  constructor(private readonly configService: ConfigService) {
    const { maxResponseCount } = this.configService.get<QueryConfig>('query');
    this.maxResponseCount = maxResponseCount;
  }

  public validate(value: number): boolean {
    return max(value, this.maxResponseCount);
  }

  public defaultMessage(): string {
    return `count must not be greater than ${this.maxResponseCount}`;
  }
}
