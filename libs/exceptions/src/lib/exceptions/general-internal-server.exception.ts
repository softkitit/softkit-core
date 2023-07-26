import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from './abstract-http.exception';

export class GeneralInternalServerException extends AbstractHttpException {
  constructor(rootCause?: unknown) {
    super(
      'common.exception.INTERNAL_ERROR.TITLE',
      'common.exception.INTERNAL_ERROR.GENERAL_DETAIL',
      HttpStatus.INTERNAL_SERVER_ERROR,
      undefined,
      rootCause,
    );
  }
}
