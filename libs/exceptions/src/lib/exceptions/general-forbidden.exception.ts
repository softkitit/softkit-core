import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from "./abstract-http.exception";

export class GeneralForbiddenException extends AbstractHttpException {
  constructor(rootCause?: unknown) {
    super(
      'common.exception.FORBIDDEN.TITLE',
      'common.exception.FORBIDDEN.GENERAL_DETAIL',
      HttpStatus.FORBIDDEN,
      undefined,
      rootCause,
    );
  }
}
