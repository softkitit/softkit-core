import { HttpStatus } from '@nestjs/common';
import AbstractHttpException from "./abstract-http.exception";

export default class FailedToCreateEntityException extends AbstractHttpException {
  constructor(
    public readonly entityName: string,
    public readonly fieldName: string,
    public readonly fieldValue: unknown,
    rootCause?: unknown,
  ) {
    super(
      'common.exception.CONFLICT.TITLE',
      'common.exception.CONFLICT.CAN_NOT_CREATE_ENTITY',
      HttpStatus.CONFLICT,
      { entityName, fieldName, fieldValue },
      rootCause,
    );
  }
}
