import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from './abstract-http.exception';
import { i18nString } from '../utils';

export class GeneralNotFoundException extends AbstractHttpException {
  constructor(rootCause?: unknown) {
    super(
      i18nString('exception.NOT_FOUND.TITLE'),
      i18nString('exception.NOT_FOUND.GENERAL_DETAIL'),
      HttpStatus.NOT_FOUND,
      undefined,
      rootCause,
    );
  }
}
