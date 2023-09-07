import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { I18nContext } from '@saas-buildkit/nestjs-i18n';
import { QueryFailedError } from 'typeorm';
import { toCapitalizedWords } from '@softkit/string-utils';
import { ErrorResponse } from '@softkit/exceptions';

@Catch(QueryFailedError)
export class PostgresDbQueryFailedErrorFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: QueryFailedError, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const i18n = I18nContext.current(host);

    let response;

    // eslint-disable-next-line sonarjs/no-small-switch
    switch (exception.driverError?.code) {
      // already exists exception from postgres either by unique constraint or primary key
      case '23505': {
        response = {
          status: HttpStatus.CONFLICT,
          type: 'todo implement link to the docs, get from config',
          title:
            i18n?.translate('common.exception.CONFLICT.TITLE') ||
            'Conflict Error',
          detail:
            i18n
              ?.translate('common.exception.CONFLICT.ENTITY_ALREADY_EXISTS', {
                args: {
                  entityName: toCapitalizedWords(exception.driverError?.table),
                },
              })
              .toString() || 'Object already exists',
          instance: ctx.getRequest().id,
        } satisfies ErrorResponse;
        break;
      }
      default: {
        response = {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          type: 'todo implement link to the docs, get from config',
          title:
            i18n?.translate('common.exception.INTERNAL_ERROR.TITLE') ||
            'Internal Error',
          detail:
            i18n
              ?.translate('common.exception.INTERNAL_ERROR.GENERAL_DETAIL')
              .toString() || 'Internal Server Error',
          instance: ctx.getRequest().id,
        } satisfies ErrorResponse;
        break;
      }
    }

    httpAdapter.reply(
      ctx.getResponse(),
      response satisfies ErrorResponse,
      response.status,
    );
  }
}
