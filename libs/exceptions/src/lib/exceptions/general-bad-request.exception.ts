import { HttpStatus } from '@nestjs/common';
import {
  I18nValidationError,
  I18nValidationException,
} from '@saas-buildkit/nestjs-i18n';
import { ErrorResponse } from '../vo/error-response.dto';

export class GeneralBadRequestException extends I18nValidationException {
  constructor(
    errors: I18nValidationError | I18nValidationError[],
    public detail?: string,
    public rootCause?: unknown,
  ) {
    super(Array.isArray(errors) ? errors : [errors], HttpStatus.BAD_REQUEST);
  }

  toErrorResponse(): Omit<ErrorResponse, 'data' | 'instance'> {
    return {
      title: 'common.exception.BAD_REQUEST.TITLE',
      detail:
        this.detail === undefined
          ? 'common.exception.BAD_REQUEST.GENERAL_DETAIL'
          : this.detail,
      status: HttpStatus.BAD_REQUEST,
      type: 'todo implement link to docs',
    };
  }
}
