import { Test } from '@nestjs/testing';
import { MailgunMailModule } from '../mail.module';
import { Injectable, Module } from '@nestjs/common';
import { MailgunMockConfig } from './app/config/config.mock';

@Injectable()
class Config {
  username = 'api';
  domain = 'sandboxea47440175b84daf8586d18c5d5e1f0a.mailgun.org';
  defaultFromEmail = 'noreply@example.com';
  defaultBccList = ['first@gmail.com', 'second@gmail.com'];
  key = 'test';
}

@Module({
  providers: [Config],
  exports: [Config],
})
class ConfigModule {}

describe('forRootAsync', () => {
  let mockConfig: MailgunMockConfig;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        MailgunMailModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (config: Config) => {
            return config;
          },
          inject: [Config],
        }),
      ],
    }).compile();

    mockConfig = moduleRef.get<Config>(Config);
  });

  it('should initialize mailgun config correctly with async configuration', () => {
    expect(mockConfig).toBeDefined();
    expect(mockConfig).toBeInstanceOf(Config);
  });
});
