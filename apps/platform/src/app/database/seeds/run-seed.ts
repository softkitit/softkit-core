import { NestFactory } from '@nestjs/core';
import { RolesSeedService } from './roles/roles-seed.service';
import { SamlConfigurationSeedService } from './saml-configuration/saml-configuration-seed.service';

import { SeedModule } from './seed.module';
import { TenantSeedService } from './tenant/tenant-seed.service';
import { UserSeedService } from './user/user-seed.service';

const runSeed = async () => {
  const app = await NestFactory.createApplicationContext(SeedModule);

  // run

  await app.get(TenantSeedService).run();

  await app.get(RolesSeedService).run();

  await app.get(UserSeedService).run();

  await app.get(SamlConfigurationSeedService).run();

  await app.close();
};

void runSeed();
