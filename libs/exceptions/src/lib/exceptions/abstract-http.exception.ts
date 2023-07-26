import { I18nContext, I18nService } from 'nestjs-i18n';
import { ErrorResponse } from '@saas-buildkit/common-types';

export class AbstractHttpException {
  constructor(
    public title: string,
    public detail: string,
    public status: number,
    public data?: Record<string, unknown>,
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

  getPresetHeadersValues(): Record<string, string> {
    return {};
  }
}
