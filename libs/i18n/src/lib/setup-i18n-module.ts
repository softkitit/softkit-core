import { I18Config } from './config/i18';
import * as path from 'node:path';
import { I18nModule } from './i18n.module';
import { I18nJsonLoader } from './loaders';
import { HeaderResolver } from './resolvers';

/**
 * @link https://github.com/Nikaple/nest-typed-config
 * */
export function setupI18NModule(
  baseDir: string,
  {
    fallbacks = {
      'en-*': 'en',
    },
    fallbackLanguage = 'en',
  }: {
    fallbacks?: Record<string, string>;
    fallbackLanguage?: string;
  } = {},
) {
  return I18nModule.forRootAsync({
    imports: undefined,
    useFactory: (config: I18Config) => {
      return {
        fallbackLanguage,
        fallbacks,
        loaders: config.paths.map((p) => {
          return new I18nJsonLoader({
            path: path.join(baseDir, p),
          });
        }),
      };
    },
    resolvers: [HeaderResolver],

    inject: [I18Config],
  });
}
