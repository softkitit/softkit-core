import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from './abstract-http.exception';
import { i18nString } from '../utils/i18n';

export class GeneralForbiddenException extends AbstractHttpException {
  constructor(errorCode?: string, rootCause?: unknown) {
    super(
      i18nString('exception.FORBIDDEN.TITLE'),
      i18nString('exception.FORBIDDEN.GENERAL_DETAIL'),
      HttpStatus.FORBIDDEN,
      undefined,
      errorCode,
      rootCause,
    );
  }
}
