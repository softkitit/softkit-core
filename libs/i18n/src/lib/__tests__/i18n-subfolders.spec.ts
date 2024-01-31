import { Test } from '@nestjs/testing';
import path from 'node:path';
import { I18nJsonLoader, I18nModule, I18nService } from '../..';

describe('i18n module including subfolders', () => {
  let i18nService: I18nService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        I18nModule.forRoot({
          fallbackLanguage: 'en',
          loaders: [
            new I18nJsonLoader({
              path: path.join(__dirname, '/i18n/'),
              includeSubfolders: true,
            }),
          ],
        }),
      ],
    }).compile();

    i18nService = module.get(I18nService);
  });

  it('i18n service should be defined', async () => {
    expect(i18nService).toBeTruthy();
  });

  it('i18n service should return translation from subfolder for default language', () => {
    expect(i18nService.translate('subfolder.sub-test.HELLO')).toBe(
      'Hello Subfolder',
    );
  });

  it('i18n service should return translation from subfolder for French', () => {
    expect(
      i18nService.translate('subfolder.sub-test.HELLO', { lang: 'fr' }),
    ).toBe('Bonjour sous-dossier');
  });
});
