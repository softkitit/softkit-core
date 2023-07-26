import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../../entities';

import { TenantSeedService } from './tenant-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  providers: [TenantSeedService],
  exports: [TenantSeedService],
})
export class TenantSeedModule {}
