import { HttpStatus } from '@nestjs/common';
import { i18nString } from '../utils/i18n';
import { AbstractHttpException } from './abstract-http.exception';

export class GeneralUnprocessableEntityException extends AbstractHttpException {
  constructor(detail?: string, errorCode?: string, rootCause?: unknown) {
    super(
      i18nString('exception.UNPROCESSABLE_ENTITY.TITLE'),
      detail ?? i18nString('exception.UNPROCESSABLE_ENTITY.GENERAL_DETAIL'),
      HttpStatus.UNPROCESSABLE_ENTITY,
      undefined,
      errorCode,
      rootCause,
    );
  }
}
