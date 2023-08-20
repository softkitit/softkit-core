import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from './abstract-http.exception';
import { i18nString } from '../utils';

export class FailedToCreateEntityException extends AbstractHttpException {
  constructor(
    public readonly entityName: string,
    public readonly fieldName: string,
    public readonly fieldValue: unknown,
    rootCause?: unknown,
  ) {
    super(
      i18nString('exception.CONFLICT.TITLE'),
      i18nString('exception.CONFLICT.CAN_NOT_CREATE_ENTITY'),
      HttpStatus.CONFLICT,
      { entityName, fieldName, fieldValue },
      rootCause,
    );
  }
}
