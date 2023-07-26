import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import { I18Config } from './config/i18';

/**
 * @link https://github.com/Nikaple/nest-typed-config
 * */
export function setupI18NModule(loadFilesPath: string, typesOutputPath: string) {

  console.log('loadFilesPath', loadFilesPath);

  return I18nModule.forRootAsync({
    useFactory: (config: I18Config) => {
      return {
        fallbackLanguage: 'en',
        fallbacks: {
          'en-*': 'en',
        },
        loaderOptions: {
          path: loadFilesPath,
          watch: config.watch,
        },
        typesOutputPath: typesOutputPath,
      };
    },
    resolvers: [HeaderResolver],

    inject: [I18Config],
  });
}
