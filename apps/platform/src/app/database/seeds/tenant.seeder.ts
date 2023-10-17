import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Tenant } from '../entities';

export class TenantSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {
    const repository = dataSource.getRepository(Tenant);
    const count = await repository.count();
    if (count === 0) {
      const tenantFactory = factoryManager.get(Tenant);
      await tenantFactory.save();
    }
  }
}
