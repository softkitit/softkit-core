import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { I18nContext } from 'nestjs-i18n';
import { ErrorResponse } from "@saas-buildkit/common-types";

@Catch(NotFoundException)
export class OverrideDefaultNotFoundFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: NotFoundException, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const i18n = I18nContext.current(host);

    const response = {
      // todo implement link to the docs, get from config
      type: 'todo implement link to the docs, get from config',
      title: i18n?.translate('common.exception.NOT_FOUND.TITLE') || 'Not Found',
      detail:
        i18n
          ?.translate('common.exception.NOT_FOUND.GENERAL_DETAIL')
          .toString() || 'Resource not found',
      status: HttpStatus.NOT_FOUND,
      instance: ctx.getRequest().id,
    } satisfies ErrorResponse;

    httpAdapter.reply(ctx.getResponse(), response, response.status);
  }
}