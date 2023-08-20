import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from './abstract-http.exception';
import { i18nString } from '../utils';

export class ObjectNotFoundException extends AbstractHttpException {
  constructor(objectName: string, rootCause?: unknown) {
    super(
      i18nString('exception.NOT_FOUND.TITLE'),
      i18nString('exception.NOT_FOUND.OBJECT_NOT_FOUND_DETAIL'),
      HttpStatus.NOT_FOUND,
      { objectName },
      rootCause,
    );
  }
}
