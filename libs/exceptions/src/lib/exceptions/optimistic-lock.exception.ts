import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from './abstract-http.exception';
import { i18nString } from '../utils';

/** todo implement swagger definition for this exception*/
export class OptimisticLockException extends AbstractHttpException {
  constructor(
    public readonly currentVersion: number,
    public readonly providedVersion: number,
    public readonly entityName: string,
    rootCause?: unknown,
  ) {
    super(
      i18nString('exception.CONFLICT.TITLE'),
      i18nString('exception.CONFLICT.OPTIMISTIC_LOCK'),
      HttpStatus.CONFLICT,
      { entityName },
      rootCause,
    );
  }

  override getPresetHeadersValues(): Record<string, string> {
    return {
      CONTENT_VERSION_HEADER: this.currentVersion.toString(),
    };
  }
}
