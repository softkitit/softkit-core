import { I18nContext, I18nService } from '@saas-buildkit/nestjs-i18n';
import { ErrorResponse } from '../vo/error-response.dto';

export class AbstractHttpException {
  constructor(
    public title: string,
    public detail: string,
    public status: number,
    public data?: object | object[],
    public rootCause?: unknown,
  ) {}

  toErrorResponse(
    requestId: string,
    i18nService?: I18nService | I18nContext,
  ): ErrorResponse {
    const title = i18nService?.translate(this.title);
    const detail = i18nService?.translate(this.detail, { args: this.data });

    return {
      // todo implement link to the docs, get from config
      type: 'todo implement link to the docs, get from config',
      title: title?.toString() || this.title,
      detail: detail?.toString() ?? this.detail,
      status: this.status,
      instance: requestId,
    } satisfies ErrorResponse;
  }

  getStatus(): number {
    return this.status;
  }

  getPresetHeadersValues(): Record<string, string> {
    return {};
  }
}
