import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../entities';

@Injectable()
export class TenantSeedService {
  private readonly logger = new Logger(TenantSeedService.name);

  constructor(
    @InjectRepository(Tenant)
    private repository: Repository<Tenant>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (count === 0) {
      const tenant = await this.repository.save(
        this.repository.create({
          id: '03c7d566-1152-476c-b2d2-5190f5de0fba',
          tenantName: 'Softkit',
          tenantUrl: 'localhost:9999',
        }),
      );

      this.logger.warn(`Tenant created: ${tenant.tenantName}`);
    } else {
      this.logger.warn(
        `Tenants already exist in the database... not tenant created`,
      );
    }
  }
}
