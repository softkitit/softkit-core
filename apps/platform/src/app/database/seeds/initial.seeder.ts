import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Tenant, UserProfile } from '../entities';
import { Logger } from '@nestjs/common';

export class InitialSeeder implements Seeder {
  private readonly logger = new Logger(InitialSeeder.name);

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {
    const repository = dataSource.getRepository(Tenant);
    const userProfileRepository = dataSource.getRepository(UserProfile);

    const count = await repository.count();
    const userProfileCount = await userProfileRepository.count();

    if (count === 0 && userProfileCount === 0) {
      this.logger.log(
        'No tenants or user profiles found. Creating new ones...',
      );

      const userProfileFactory = factoryManager.get(UserProfile);
      const owner = await userProfileFactory.save();
      this.logger.log(`User profile created with ID: ${owner.id}`);

      const tenantFactory = factoryManager.get(Tenant);
      tenantFactory.setMeta({ ownerId: owner.id });

      const tenant = await tenantFactory.save();
      this.logger.log(`Tenant created with ID: ${tenant.id}`);
    }
  }
}
