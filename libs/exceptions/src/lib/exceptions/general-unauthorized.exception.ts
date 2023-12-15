import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from './abstract-http.exception';
import { i18nString } from '../utils/i18n';

export class GeneralUnauthorizedException extends AbstractHttpException {
  constructor(errorCode?: string, rootCause?: unknown) {
    super(
      i18nString('exception.UNAUTHORIZED.TITLE'),
      i18nString('exception.UNAUTHORIZED.GENERAL_DETAIL'),
      HttpStatus.UNAUTHORIZED,
      undefined,
      errorCode,
      rootCause,
    );
  }
}
