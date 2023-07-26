import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomUserRole, DefaultRole, Tenant } from '../../entities';
import { RolesSeedService } from './roles-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([DefaultRole, CustomUserRole, Tenant])],
  providers: [RolesSeedService],
  exports: [RolesSeedService],
})
export class RolesSeedModule {}
