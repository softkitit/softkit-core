import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { I18nContext } from '@saas-buildkit/nestjs-i18n';
import { ErrorResponse } from '../vo/error-response.dto';
import { I18nTranslations } from '../generated/i18n.generated';

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AnyExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    if (exception instanceof ServiceUnavailableException) {
      httpAdapter.reply(ctx.getResponse(), exception.getResponse(), 503);
    }

    const i18n = I18nContext.current<I18nTranslations>(host);

    const response = {
      // todo implement link to the docs, get from config
      type: 'todo implement link to the docs, get from config',
      title:
        i18n?.translate('exception.INTERNAL_ERROR.TITLE') || 'Internal Error',
      detail:
        i18n?.translate('exception.INTERNAL_ERROR.GENERAL_DETAIL').toString() ||
        'Internal Server Error',
      status: 500,
      instance: ctx.getRequest().id,
    } satisfies ErrorResponse;

    this.logger.error(
      `Unexpected error happen, this require immediate attention ${exception}`,
    );

    httpAdapter.reply(ctx.getResponse(), response, response.status);
  }
}
