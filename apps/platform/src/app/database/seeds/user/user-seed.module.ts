import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomUserRole, Tenant, User } from '../../entities';
import { UserSeedService } from './user-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Tenant, CustomUserRole])],
  providers: [UserSeedService],
  exports: [UserSeedService],
})
export class UserSeedModule {}
