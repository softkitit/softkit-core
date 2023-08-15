import { ValidationOptions } from 'class-validator';

export interface IValidatorDefinition<VALUE_TYPE, VALIDATION_OPTIONS> {
  name: string;
  defaultValidationMessage: string;
  validator: (v: VALUE_TYPE, options: VALIDATION_OPTIONS) => boolean;
  decorator: (
    options: VALIDATION_OPTIONS,
    validationOptions?: ValidationOptions,
  ) => PropertyDecorator;
}
