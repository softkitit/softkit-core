import { Test } from '@nestjs/testing';
import { LoggerConfig } from '../config/logger';
import { LoggerRootConfig } from './app/config/logger-root.config';

describe('setup logger', () => {
  it('should setup logger', async () => {
    const { AppModule } = require('./app/app.module');
    const testingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const loggerConfig = testingModule.get(LoggerConfig);
    const rootConfig = testingModule.get(LoggerRootConfig);

    expect(loggerConfig).toBeDefined();

    expect(loggerConfig.colorize).toBe(false);
    expect(loggerConfig.prettyLogs).toBe(false);
    expect(loggerConfig.defaultLevel).toBe('debug');

    expect(rootConfig).toBeDefined();
  });
});
