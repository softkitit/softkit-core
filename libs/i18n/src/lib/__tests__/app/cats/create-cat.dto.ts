import { IsNotEmpty, Min } from 'class-validator';
import { I18nTranslations } from '../../generated/i18n.generated';
import { i18nValidationMessage } from '../../../utils';

export class CreateCatDto {
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  name!: string;

  @Min(10, {
    message: i18nValidationMessage<I18nTranslations>('validation.MIN', {
      message: 'COOL',
      context: {
        errorCode: 1001,
        devNote: 'Older cats',
      },
    }),
  })
  age!: number;
}
