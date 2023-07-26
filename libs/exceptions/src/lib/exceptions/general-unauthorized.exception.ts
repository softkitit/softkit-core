import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from './abstract-http.exception';

export class GeneralUnauthorizedException extends AbstractHttpException {
  constructor(rootCause?: unknown) {
    super(
      'common.exception.UNAUTHORIZED.TITLE',
      'common.exception.UNAUTHORIZED.GENERAL_DETAIL',
      HttpStatus.UNAUTHORIZED,
      undefined,
      rootCause,
    );
  }
}
