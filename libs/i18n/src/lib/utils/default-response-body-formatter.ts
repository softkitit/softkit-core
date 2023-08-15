import { I18nValidationException } from '@saas-buildkit/nestjs-i18n/dist/interfaces/i18n-validation-error.interface';
import { ArgumentsHost } from '@nestjs/common';
import {
  ErrorResponse,
  GeneralBadRequestException,
} from '@saas-buildkit/exceptions';
import { I18nContext } from '@saas-buildkit/nestjs-i18n';

export function responseBodyFormatter(
  host: ArgumentsHost,
  exc: I18nValidationException,
  formattedErrors: object,
): Record<string, unknown> {
  const instance = host.switchToHttp().getRequest().requestId;

  const ctx = I18nContext.current();

  return exc instanceof GeneralBadRequestException
    ? ({
        ...exc.toErrorResponse(),
        instance,
        data: formattedErrors,
      } satisfies ErrorResponse)
    : ({
        type: 'todo implement link to docs',
        title:
          ctx?.translate('common.exception.BAD_REQUEST.TITLE') || 'Bad Request',
        detail:
          ctx?.translate('common.exception.BAD_REQUEST.GENERAL_DETAIL') ||
          'Can not validate inbound request body',
        status: exc.getStatus(),
        instance,
        data: formattedErrors,
      } satisfies ErrorResponse);
}
