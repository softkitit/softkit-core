import { Test, TestingModule } from '@nestjs/testing';
import { Global, Injectable, Module } from '@nestjs/common';
import { AbstractMailService } from '../services';
import { SENDGRID_CLIENT_TOKEN } from '../constants';
import { SendgridMailModule } from '../modules';

@Injectable()
class Config {
  defaultFromEmail = 'noreply@example.com';
  defaultBccList = ['first@gmail.com', 'second@gmail.com'];
  apiKey = 'SG.test';
  dataResidency = 'eu';
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
        SendgridMailModule.forRootAsync({
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
    expect(module.get(SENDGRID_CLIENT_TOKEN)).toBeDefined();
  });
});
