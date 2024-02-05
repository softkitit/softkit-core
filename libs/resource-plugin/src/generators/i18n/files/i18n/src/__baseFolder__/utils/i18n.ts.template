import { I18nTranslations } from '../generated/i18n.generated';

import {
  Path,
  i18nValidationMessage,
  i18nValidationMessageString,
} from '@softkit/i18n';

export function i18nString(key: Path<I18nTranslations>) {
  return i18nValidationMessageString<I18nTranslations>(key);
}

export function i18n(key: Path<I18nTranslations>, args?: unknown) {
  return i18nValidationMessage<I18nTranslations>(key, args);
}
