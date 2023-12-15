import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from './abstract-http.exception';
import { i18nString } from '../utils/i18n';
import { ObjectNotFoundData } from './vo/object-not-found.dto';

export class ObjectNotFoundException extends AbstractHttpException<ObjectNotFoundData> {
  constructor(entityName: string, errorCode?: string, rootCause?: unknown) {
    super(
      i18nString('exception.NOT_FOUND.TITLE'),
      i18nString('exception.NOT_FOUND.OBJECT_NOT_FOUND_DETAIL'),
      HttpStatus.NOT_FOUND,
      { entityName },
      errorCode,
      rootCause,
    );
  }
}
