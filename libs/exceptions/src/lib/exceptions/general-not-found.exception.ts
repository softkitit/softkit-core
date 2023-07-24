import { HttpStatus } from '@nestjs/common';
import AbstractHttpException from "./abstract-http.exception";

export default class GeneralNotFoundException extends AbstractHttpException {
  constructor(rootCause?: unknown) {
    super(
      'common.exception.NOT_FOUND.TITLE',
      'common.exception.NOT_FOUND.GENERAL_DETAIL',
      HttpStatus.NOT_FOUND,
      undefined,
      rootCause,
    );
  }
}
