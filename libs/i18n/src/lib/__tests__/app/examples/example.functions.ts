import { ValidationError } from '@nestjs/common';
import {
  I18nValidationException,
  mapChildrenToValidationErrors,
} from '../../../../';
import { ArgumentsHost } from '@nestjs/common/interfaces';

export const exampleErrorFormatter = (errors: ValidationError[]) => {
  const errorMessages: Record<string, string[]> = {};

  for (const error_ of errors) {
    const mappedErrors = mapChildrenToValidationErrors(error_);

    for (const error of mappedErrors) {
      const constraints = error.constraints ?? {};
      errorMessages[error.property] = Object.values(constraints);
    }
  }

  return errorMessages;
};

export const exampleResponseBodyFormatter = (
  host: ArgumentsHost,
  exc: I18nValidationException,
  formattedErrors: object,
) => {
  return {
    type: 'static',
    status: exc.getStatus(),
    message: exc.getResponse(),
    data: formattedErrors,
  };
};
