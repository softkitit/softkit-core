import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from './abstract-http.exception';
import { i18nString } from '../utils/i18n';

export class GeneralInternalServerException extends AbstractHttpException {
  constructor(rootCause?: unknown, errorCode?: string) {
    super(
      i18nString('exception.INTERNAL_ERROR.TITLE'),
      i18nString('exception.INTERNAL_ERROR.GENERAL_DETAIL'),
      HttpStatus.INTERNAL_SERVER_ERROR,
      undefined,
      rootCause,
      errorCode,
    );
  }
}
