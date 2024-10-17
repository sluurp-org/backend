import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'isVariableConstraint' })
@Injectable()
export class IsVariableConstraint implements ValidatorConstraintInterface {
  validate(content: string): boolean {
    const findVariables = content.match(/#{(.*?)}/g) || [];
    return findVariables.length === 0;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return validationArguments?.property + ' must not contain variables';
  }
}
