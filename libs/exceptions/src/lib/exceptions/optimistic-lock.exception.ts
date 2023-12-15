import { AbstractHttpException } from './abstract-http.exception';
import { CONTENT_VERSION_HEADER } from '../utils/constants';
import { i18nString } from '../utils/i18n';
import { HttpStatus } from '@nestjs/common';
import { OptimisticLockData } from './vo/optimistic-lock.dto';

export class OptimisticLockException extends AbstractHttpException<OptimisticLockData> {
  constructor(
    public readonly currentVersion: number,
    rootCause?: unknown,
  ) {
    super(
      i18nString('exception.CONFLICT.TITLE'),
      i18nString('exception.CONFLICT.OPTIMISTIC_LOCK'),
      HttpStatus.CONFLICT,
      { currentVersion },
      undefined,
      rootCause,
    );
  }

  override getPresetHeadersValues(): Record<string, string> {
    return {
      [CONTENT_VERSION_HEADER]: this.currentVersion.toString(),
    };
  }
}
