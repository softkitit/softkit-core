import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from './abstract-http.exception';
import { i18nString } from '../utils/i18n';
import { ConflictEntityCreationData } from './vo/conflict-entity-creation.dto';

export class ConflictEntityCreationException extends AbstractHttpException<ConflictEntityCreationData> {
  constructor(
    public readonly entityName: string,
    public readonly fieldName: string,
    public readonly fieldValue: unknown,
    errorCode?: string,
    rootCause?: unknown,
  ) {
    super(
      i18nString('exception.CONFLICT.TITLE'),
      i18nString('exception.CONFLICT.CAN_NOT_CREATE_ENTITY'),
      HttpStatus.CONFLICT,
      { entityName, fieldName, fieldValue },
      errorCode,
      rootCause,
    );
  }
}
