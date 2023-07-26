import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from './abstract-http.exception';

export class ObjectNotFoundException extends AbstractHttpException {
  constructor(objectName: string, rootCause?: unknown) {
    super(
      'common.exception.NOT_FOUND.TITLE',
      'common.exception.NOT_FOUND.OBJECT_NOT_FOUND_DETAIL',
      HttpStatus.NOT_FOUND,
      { objectName },
      rootCause,
    );
  }
}
