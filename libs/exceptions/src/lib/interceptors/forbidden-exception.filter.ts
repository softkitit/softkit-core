import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { I18nContext } from '@saas-buildkit/nestjs-i18n';
import { ErrorResponse } from '../vo/error-response.dto';
import { I18nTranslations } from '../generated/i18n.generated';

@Catch(ForbiddenException)
export class OverrideDefaultForbiddenExceptionFilter
  implements ExceptionFilter
{
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: ForbiddenException, host: ArgumentsHost): void {
    // In ce rtain situations `httpAdapter` might not be available in the
    // const ructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const i18n = I18nContext.current<I18nTranslations>(host);

    const response = {
      // todo  implement link to the docs, get from config
      type: 'todo implement link to the docs, get from config',
      title: i18n?.translate('exception.FORBIDDEN.TITLE') || 'Forbidden',
      detail:
        i18n?.translate('exception.FORBIDDEN.GENERAL_DETAIL').toString() ||
        'Forbidden access to the resource. Check permissions.',
      status: HttpStatus.FORBIDDEN,
      instance: ctx.getRequest().id,
    } satisfies ErrorResponse;

    httpAdapter.reply(ctx.getResponse(), response, response.status);
  }
}
