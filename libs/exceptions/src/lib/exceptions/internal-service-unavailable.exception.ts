import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from './abstract-http.exception';
import { i18nString } from '../utils/i18n';

/**
 * This is a service unavailable exception that may occur when
 * the call to internal service fails for a long time or just down
 * */
export class InternalServiceUnavailableHttpException extends AbstractHttpException {
  constructor(
    externalServiceIdentifier?: string,
    errorCode?: string,
    rootCause?: unknown,
  ) {
    super(
      i18nString('exception.SERVICE_UNAVAILABLE.TITLE'),
      i18nString('exception.SERVICE_UNAVAILABLE.GENERAL_DETAIL'),
      HttpStatus.SERVICE_UNAVAILABLE,
      {
        externalServiceIdentifier,
      },
      errorCode,
      rootCause,
    );
  }
}
