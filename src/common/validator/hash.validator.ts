import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'isBcryptHash' })
@Injectable()
export class IsBcryptHashConstraint implements ValidatorConstraintInterface {
  validate(hashContent: string): boolean {
    const bcryptHashRegex = /^\$2[ayb]/;
    return bcryptHashRegex.test(hashContent);
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return validationArguments?.property + ' must be a bcrypt hash';
  }
}
