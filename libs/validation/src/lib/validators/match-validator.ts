import { ClassConstructor } from 'class-transformer';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export const MatchesWithProperty = <T>(
  type: ClassConstructor<T>,
  property: (o: T) => unknown,
  validationOptions?: ValidationOptions,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchConstraint,
    });
  };
};

@ValidatorConstraint({ name: 'match' })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const [fn] = args.constraints;
    return fn(args.object) === value;
  }
}
