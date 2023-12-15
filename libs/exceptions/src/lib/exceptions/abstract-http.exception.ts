import { I18nContext, I18nService } from '@saas-buildkit/nestjs-i18n';
import { ErrorResponse } from '../vo/error-response.dto';

export class AbstractHttpException<ADDITIONAL_DATA extends object = object> {
  constructor(
    public title: string,
    public detail: string,
    public status: number,
    public data?: ADDITIONAL_DATA | ADDITIONAL_DATA[],
    public rootCause?: unknown,
    public errorCode?: string,
  ) {}

  toErrorResponse(
    requestId: string,
    i18nService?: I18nService | I18nContext,
  ): ErrorResponse {
    const title = i18nService?.translate(this.title);
    const detail = i18nService?.translate(this.detail, {
      args: this.data,
    });

    return {
      // todo  implement link to the docs, get from config
      type: 'todo implement link to the docs, get from config',
      title: title?.toString() ?? /* istanbul ignore next */ this.title,
      detail: detail?.toString() ?? /* istanbul ignore next */ this.detail,
      status: this.status,
      instance: requestId,
      errorCode: this.errorCode,
    } satisfies ErrorResponse;
  }

  getPresetHeadersValues(): Record<string, string> {
    return {};
  }
}
