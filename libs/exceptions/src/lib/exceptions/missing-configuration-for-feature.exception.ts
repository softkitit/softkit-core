import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from "./abstract-http.exception";

export class MissingConfigurationForFeatureException extends AbstractHttpException {
  constructor(featureName: string, rootCause?: unknown) {
    super(
      'common.exception.NOT_FOUND.TITLE',
      'common.exception.NOT_FOUND.MISSING_CONFIGURATION_FOR_FEATURE_DETAIL',
      HttpStatus.NOT_FOUND,
      {
        featureName,
      },
      rootCause,
    );
  }
}
