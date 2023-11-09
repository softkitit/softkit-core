import { Module } from '@nestjs/common';
import { setupLoggerModule } from '@softkit/logger';
import { Logger } from '@nestjs/common';
import { setupYamlBaseConfigModule } from '@softkit/config';
import { RootConfig } from './config/root.config';

@Module({
  imports: [setupLoggerModule()],
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
