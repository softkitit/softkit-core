import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { I18nContext } from '../../../../';
import { I18nTranslations } from '../../generated/i18n.generated';

@Injectable()
export class TestGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const response = context.switchToHttp().getResponse();

    const i18n = I18nContext.current<I18nTranslations>();
    response.header(
      'X-Test',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      i18n.t('test.CURRENT_LANGUAGE', { args: { lang: i18n.lang } }),
    );

    return true;
  }
}
