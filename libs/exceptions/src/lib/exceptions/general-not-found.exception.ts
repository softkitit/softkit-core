import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from './abstract-http.exception';
import { i18nString } from '../utils/i18n';

export class GeneralNotFoundException extends AbstractHttpException {
  constructor(rootCause?: unknown, errorCode?: string) {
    super(
      i18nString('exception.NOT_FOUND.TITLE'),
      i18nString('exception.NOT_FOUND.GENERAL_DETAIL'),
      HttpStatus.NOT_FOUND,
      undefined,
      rootCause,
      errorCode,
    );
  }
}
