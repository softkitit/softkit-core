import { Test, TestingModule } from '@nestjs/testing';
import { MailgunMailModule } from '../modules/mailgun/mail.module';
import { Global, Injectable, Module } from '@nestjs/common';
import { AbstractMailService } from '../services';
import { MAILGUN_CLIENT_TOKEN } from '../constants';

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
@Global()
class ConfigModule {}

describe('forRootAsync', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule,
        MailgunMailModule.forRootAsync({
          useFactory: async (config: Config) => {
            return config;
          },
          inject: [Config],
        }),
      ],
    }).compile();
  });

  it('should initialize mailgun config correctly with async configuration', () => {
    expect(module.get(AbstractMailService)).toBeDefined();
    expect(module.get(MAILGUN_CLIENT_TOKEN)).toBeDefined();
  });
});
