import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ValidationError,
} from '@nestjs/common';
import iterate from 'iterare';
import { I18nContext } from '../i18n.context';
import {
  I18nValidationError,
  I18nValidationExceptionFilterDetailedErrorsOption,
  I18nValidationExceptionFilterErrorFormatterOption,
  I18nValidationException,
} from '../interfaces';
import { mapChildrenToValidationErrors, formatI18nErrors } from '../utils';
import { GqlContextType } from '@nestjs/graphql';

type I18nValidationExceptionFilterOptions =
  | I18nValidationExceptionFilterDetailedErrorsOption
  | I18nValidationExceptionFilterErrorFormatterOption;

@Catch(I18nValidationException)
export class I18nValidationExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly options: I18nValidationExceptionFilterOptions = {
      detailedErrors: true,
    },
  ) {}

  catch(exception: I18nValidationException, host: ArgumentsHost) {
    const i18n = I18nContext.current();

    const errors = formatI18nErrors(exception.errors ?? [], i18n?.service, {
      lang: i18n?.lang,
    });

    const normalizedErrors = this.normalizeValidationErrors(errors);

    const hostType = host.getType<GqlContextType>();

    if (hostType === 'http') {
      const response = host.switchToHttp().getResponse();

      const responseBody = this.buildResponseBody(
        host,
        exception,
        normalizedErrors,
      );

      return response
        .status(this.options.errorHttpStatusCode ?? exception.getStatus())
        .send(responseBody);
    } else if (hostType === 'graphql') {
      exception.errors = normalizedErrors as I18nValidationError[];
      return exception;
    } else {
      return new Error(`Unsupported host type: ${host.getType()}`);
    }
  }

  protected buildResponseBody(
    host: ArgumentsHost,
    exc: I18nValidationException,
    errors: string[] | I18nValidationError[] | object,
  ) {
    return 'responseBodyFormatter' in this.options &&
      this.options.responseBodyFormatter
      ? this.options.responseBodyFormatter(host, exc, errors)
      : {
          statusCode:
            this.options.errorHttpStatusCode === undefined
              ? exc.getStatus()
              : this.options.errorHttpStatusCode,
          message: exc.getResponse(),
          errors,
        };
  }

  protected normalizeValidationErrors(
    validationErrors: ValidationError[],
  ): string[] | I18nValidationError[] | object {
    if (
      this.isWithErrorFormatter(this.options) &&
      !('detailedErrors' in this.options) &&
      this.options.errorFormatter
    ) {
      return this.options.errorFormatter(validationErrors);
    }

    if (
      !this.isWithErrorFormatter(this.options) &&
      !this.options.detailedErrors
    ) {
      return this.flattenValidationErrors(validationErrors);
    }

    return validationErrors;
  }

  protected flattenValidationErrors(
    validationErrors: ValidationError[],
  ): string[] {
    return iterate(validationErrors)
      .map((error) => mapChildrenToValidationErrors(error))
      .flatten()
      .filter((item) => !!item.constraints)
      .map((item) => Object.values(item.constraints ?? {}))
      .flatten()
      .toArray();
  }

  private isWithErrorFormatter(
    options: I18nValidationExceptionFilterOptions,
  ): options is I18nValidationExceptionFilterErrorFormatterOption {
    return 'errorFormatter' in options;
  }
}
