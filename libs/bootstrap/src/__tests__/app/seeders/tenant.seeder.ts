import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { TenantEntity } from '../repositories/tenant.entity';

export class TenantSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {
    const repository = dataSource.getRepository(TenantEntity);
    const count = await repository.count();
    if (count === 0) {
      const tenantFactory = factoryManager.get(TenantEntity);
      await tenantFactory.save();
    }
  }
}
