import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from './abstract-http.exception';
import { i18nString } from '../utils/i18n';

export class MissingConfigurationForFeatureException extends AbstractHttpException {
  constructor(featureName: string, errorCode?: string, rootCause?: unknown) {
    super(
      i18nString('exception.NOT_FOUND.TITLE'),
      i18nString(
        'exception.NOT_FOUND.MISSING_CONFIGURATION_FOR_FEATURE_DETAIL',
      ),
      HttpStatus.NOT_FOUND,
      {
        featureName,
      },
      errorCode,
      rootCause,
    );
  }
}
