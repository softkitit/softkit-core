import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { HttpAdapterHost } from '@nestjs/core';
import { I18nContext } from '@saas-buildkit/nestjs-i18n';
import { AbstractHttpException } from '../exceptions/abstract-http.exception';

@Catch(AbstractHttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: AbstractHttpException, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const i18n = I18nContext.current(host);

    this.presetHeaders(exception, ctx);

    if (exception.status > 499) {
      this.logger.error(
        'Internal server error. Require immediate attention, details: %o',
        exception,
      );
    } else {
      this.logger.debug(
        `Error thrown - details: ${JSON.stringify(exception, undefined, 2)}`,
      );
    }

    const response = exception.toErrorResponse(ctx.getRequest().id, i18n);

    httpAdapter.reply(ctx.getResponse(), response, response.status);
  }

  /**
   * warn impure utility method, that is modifying headers of the response
   * */
  private presetHeaders(
    exception: AbstractHttpException,
    ctx: HttpArgumentsHost,
  ) {
    for (const [key, value] of Object.entries(
      exception.getPresetHeadersValues(),
    )) {
      ctx.getResponse().header(key, value);
    }
  }
}
