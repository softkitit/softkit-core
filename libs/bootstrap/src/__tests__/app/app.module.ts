import { Module } from '@nestjs/common';
import { LoggerConfig, setupLoggerModule } from '@softkit/logger';
import { Logger } from '@nestjs/common';
import { setupYamlBaseConfigModule } from '@softkit/config';
import { RootConfig } from './config/root.config';

@Module({
  imports: [
    {
      module: class {},
      global: true,
      providers: [
        {
          provide: LoggerConfig,
          useClass: LoggerConfig,
        },
      ],
      exports: [LoggerConfig],
    },
    setupLoggerModule(),
  ],
  providers: [Logger],
})
export class BootstrapTestAppModule {}

@Module({
  imports: [
    setupYamlBaseConfigModule(__dirname, RootConfig),
    setupLoggerModule(),
  ],
  providers: [Logger],
})
export class TestAppModule {}
