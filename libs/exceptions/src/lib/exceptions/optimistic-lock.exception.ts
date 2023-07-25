import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from "./abstract-http.exception";

export class OptimisticLockException extends AbstractHttpException {
  constructor(
    public readonly currentVersion: number,
    public readonly providedVersion: number,
    public readonly entityName: string,
    rootCause?: unknown,
  ) {
    super(
      'common.exception.CONFLICT.TITLE',
      'common.exception.CONFLICT.OPTIMISTIC_LOCK',
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
