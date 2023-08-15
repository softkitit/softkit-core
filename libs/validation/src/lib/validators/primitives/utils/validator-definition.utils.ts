import { IValidatorDefinition } from '../validator-definition.interface';
import {
  I18nValidationError,
  i18nValidationMessage,
} from '@saas-buildkit/nestjs-i18n';
import { TransformFnParams } from 'class-transformer';
import { GeneralBadRequestException } from '@saas-buildkit/exceptions';

type TransformFnParamsEssentials = Omit<
  TransformFnParams,
  'obj' | 'type' | 'options'
>;

export function validationDefinitionToI18NError<T, E>(
  validatorDefinition: IValidatorDefinition<T, E>,
  params: TransformFnParamsEssentials,
  constraint?: E,
  args?: unknown,
): I18nValidationError {
  // it's transforming a message to format -
  // "common.validation.MAX_LENGTH|{ "constraints": [ "10" ], "args": {} }"
  const validationMessageFormatted = i18nValidationMessage(
    params.key,
    args,
  )({
    // even this one is not really used and not passed to the message function
    property: params.key,
    value: params.value,
    constraints: constraint === undefined ? [] : [constraint],
    // this one is not used in the i18nValidationMessage function
    targetName: '',
    // this one also is not used in the i18nValidationMessage function
    object: {},
  });

  return {
    property: params.key,
    value: params.value,
    constraints: {
      [validatorDefinition.name]: validationMessageFormatted,
    },
  } satisfies I18nValidationError;
}

export function validateAndThrow<T, E>(
  validatorDefinition: IValidatorDefinition<T, E>,
  fieldName: string,
  value: T,
  constraint: E,
  args?: unknown,
) {
  const isValid = validatorDefinition.validator(value, constraint);

  if (!isValid) {
    throwValidationException(
      validatorDefinition,
      {
        key: fieldName,
        value,
      },
      constraint,
      args,
    );
  }
}

export function validateAndReturnError<T, E>(
  validatorDefinition: IValidatorDefinition<T, E>,
  fieldName: string,
  value: T,
  constraint: E,
  args?: unknown,
) {
  const isValid = validatorDefinition.validator(value, constraint);

  return isValid
    ? undefined
    : validationDefinitionToI18NError(
        validatorDefinition,
        {
          key: fieldName,
          value,
        },
        constraint,
        args,
      );
}

export function throwValidationException<T, E>(
  validatorDefinition: IValidatorDefinition<T, E>,
  params: TransformFnParamsEssentials,
  constraint?: E,
  args?: unknown,
) {
  const validationError = validationDefinitionToI18NError(
    validatorDefinition,
    params,
    constraint,
    args,
  );

  throw new GeneralBadRequestException(validationError);
}
