import { IValidatorDefinition } from './validator-definition.interface';
import {
  I18nValidationError,
  i18nValidationMessage,
} from '@saas-buildkit/nestjs-i18n';
import { TransformFnParams } from 'class-transformer';
import { GeneralBadRequestException } from '@softkit/exceptions';
import { Path } from '@saas-buildkit/nestjs-i18n/dist/types';
import { I18nTranslations } from '../../generated/i18n.generated';

type TransformFnParamsEssentials = Omit<
  TransformFnParams,
  'obj' | 'type' | 'options'
>;

function validationDefinitionToI18NError<T, E>(
  validatorDefinition: IValidatorDefinition<T, E>,
  params: TransformFnParamsEssentials,
  constraint?: E,
  overrideDefaultMessage?: string,
  args?: unknown,
): I18nValidationError {
  // it's transforming a message to format -
  // "common.validation.MAX_LENGTH|{ "constraints": [ "10" ], "args": {} }"
  const validationMessageFormatted = i18nValidationMessage(
    overrideDefaultMessage ?? validatorDefinition.defaultValidationMessage,
    args,
  )({
    // this one is not really used and not passed to the message function
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

/**
 * @return void or throw error if invalid
 * */
export function validateAndThrow<T, E>(
  validatorDefinition: IValidatorDefinition<T, E>,
  fieldName: string,
  value: T,
  constraint?: E,
  overrideDefaultMessage?: string,
  args?: unknown,
) {
  const isValid = validatorDefinition.validator(value, constraint as E);

  if (!isValid) {
    throwValidationException(
      validatorDefinition,
      {
        key: fieldName,
        value,
      },
      constraint,
      overrideDefaultMessage,
      args,
    );
  }
}

/**
 * @return error or undefined if valid
 * */
export function validateAndReturnError<T, E>(
  validatorDefinition: IValidatorDefinition<T, E>,
  fieldName: string,
  value: T,
  constraint?: E,
  overrideDefaultMessage?: Path<I18nTranslations>,
  args?: unknown,
) {
  const isValid = validatorDefinition.validator(value, constraint as E);

  return isValid
    ? undefined
    : validationDefinitionToI18NError(
        validatorDefinition,
        {
          key: fieldName,
          value,
        },
        constraint,
        overrideDefaultMessage,
        args,
      );
}

function throwValidationException<T, E>(
  validatorDefinition: IValidatorDefinition<T, E>,
  params: TransformFnParamsEssentials,
  constraint?: E,
  overrideDefaultMessage?: string,
  args?: unknown,
) {
  const validationError = validationDefinitionToI18NError(
    validatorDefinition,
    params,
    constraint,
    overrideDefaultMessage,
    args,
  );

  throw new GeneralBadRequestException(validationError);
}
