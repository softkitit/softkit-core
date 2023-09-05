import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { HealthConfig } from './config/health.config';
import { HealthIndicatorFunction } from '@nestjs/terminus/dist/health-indicator';
import { SkipAuth } from '@softkit/auth';
import { ApiTags } from '@nestjs/swagger';

@Controller({
  path: 'health',
})
@ApiTags('Health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly healthConfig: HealthConfig,
    private db: TypeOrmHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}

  @Get()
  @SkipAuth()
  @HealthCheck()
  public getHealth() {
    const healthIndicators: Array<HealthIndicatorFunction> = [
      this.getDbHealthCheck(),
      this.getDiskHealthcheck(),
    ].filter((v): v is HealthIndicatorFunction => v !== undefined);

    return this.health.check(healthIndicators);
  }

  private getDbHealthCheck() {
    return this.healthConfig.db.enabled
      ? () => this.db.pingCheck('database')
      : undefined;
  }

  private getDiskHealthcheck() {
    return this.healthConfig.disk.enabled
      ? ((() =>
          this.disk.checkStorage('storage', {
            path: this.healthConfig.disk.path,
            thresholdPercent: this.healthConfig.disk.thresholdPercent,
          })) as HealthIndicatorFunction)
      : undefined;
  }
}
