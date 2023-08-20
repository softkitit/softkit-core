import {
  HeaderResolver,
  I18nJsonLoader,
  I18nModule,
} from '@saas-buildkit/nestjs-i18n';
import { I18Config } from './config/i18';
import * as path from 'node:path';

/**
 * @link https://github.com/Nikaple/nest-typed-config
 * */
export function setupI18NModule(
  baseDir: string,
  typesOutputPath: string,
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
    useFactory: (config: I18Config) => {
      return {
        fallbackLanguage,
        fallbacks,
        loaders: config.paths.map((p) => {
          return new I18nJsonLoader({
            path: path.join(baseDir, p),
          });
        }),
        typesOutputPath: typesOutputPath,
      };
    },
    resolvers: [HeaderResolver],

    inject: [I18Config],
  });
}
