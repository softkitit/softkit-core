import { Module } from '@nestjs/common';
import { SampleController } from './sample.controller';
import { I18nJsonLoader, I18nModule } from '@saas-buildkit/nestjs-i18n';
import * as path from 'node:path';
import { MappingController } from './mapping.controller';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaders: [
        new I18nJsonLoader({
          path: path.join(__dirname, '../../../src/lib/i18n/'),
        }),
      ],
    }),
  ],
  controllers: [SampleController, MappingController],
})
export class SampleModule {}
