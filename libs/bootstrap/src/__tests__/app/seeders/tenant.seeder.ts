import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { TenantEntity } from '../repositories/tenant.entity';
import { UserProfile } from '../repositories/user-profile.entity';

export class TenantSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {
    const repository = dataSource.getRepository(TenantEntity);
    const userProfileRepository = dataSource.getRepository(UserProfile);

    const count = await repository.count();
    const userProfileCount = await userProfileRepository.count();

    if (count === 0 && userProfileCount === 0) {
      const userProfileFactory = factoryManager.get(UserProfile);
      const owner = await userProfileFactory.save();

      const tenantFactory = factoryManager.get(TenantEntity);
      tenantFactory.setMeta({ ownerId: owner.id });

      await tenantFactory.save();
    }
  }
}
