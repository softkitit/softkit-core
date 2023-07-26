import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { I18nContext } from 'nestjs-i18n';
import { ErrorResponse } from '@saas-buildkit/common-types';

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AnyExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const i18n = I18nContext.current(host);

    const response = {
      // todo implement link to the docs, get from config
      type: 'todo implement link to the docs, get from config',
      title:
        i18n?.translate('common.exception.INTERNAL_ERROR.TITLE') ||
        'Internal Error',
      detail:
        i18n
          ?.translate('common.exception.INTERNAL_ERROR.GENERAL_DETAIL')
          .toString() || 'Internal Server Error',
      status: 500,
      instance: ctx.getRequest().id,
    } satisfies ErrorResponse;

    this.logger.error(
      `Unexpected error happen, this require immediate attention ${exception}`,
    );

    httpAdapter.reply(ctx.getResponse(), response, response.status);
  }
}
