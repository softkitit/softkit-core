import path from 'node:path';
import { I18nOptions } from '../../../interfaces';
import { I18nJsonLoader } from '../../../loaders';

const i18nOptions: I18nOptions = {
  fallbackLanguage: 'en',
  loaders: [
    new I18nJsonLoader({
      path: path.join(__dirname, '../../i18n'),
    }),
  ],
};

export { i18nOptions };
