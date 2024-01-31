import { FailingController } from './failing.controller';
import { I18nJsonLoader, I18nModule } from '@softkit/i18n';
import * as path from 'node:path';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      typesOutputPath: path.join(
        __dirname,
        '../../lib/generated/i18n.generated.ts',
      ),
      loaders: [
        new I18nJsonLoader({
          path: path.join(__dirname, '../../lib/i18n/'),
        }),
      ],
    }),
  ],
  controllers: [FailingController],
  providers: [],
})
export class AppModule {}
