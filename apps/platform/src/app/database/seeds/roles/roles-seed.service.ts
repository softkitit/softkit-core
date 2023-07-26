import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { CustomUserRole, DefaultRole, Tenant } from '../../entities';

@Injectable()
export class RolesSeedService {
  private readonly logger = new Logger(RolesSeedService.name);

  constructor(
    @InjectRepository(CustomUserRole)
    private customUserRoleRepository: Repository<CustomUserRole>,
    @InjectRepository(DefaultRole)
    private defaultRoleRepository: Repository<DefaultRole>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async run() {
    const count = await this.customUserRoleRepository.count();

    if (count === 0) {
      if (count === 0) {
        const tenants = await this.tenantRepository.find({
          take: 2,
        });

        if (tenants.length === 1) {
          const tenant = tenants[0];

          const rolesToSaveForTenant = await this.defaultRoleRepository
            .find()
            .then((roles) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              return roles.map(({ id: _, ...otherRoleData }) => {
                return {
                  ...otherRoleData,
                  tenantId: tenant.id,
                };
              });
            });

          const savedRoles = await this.customUserRoleRepository.save(
            rolesToSaveForTenant,
          );

          this.logger.log(
            `${savedRoles.length} Roles for tenant ${tenant.tenantName} created.`,
          );
        } else {
          this.logger.warn(
            `Tenants not found in the database or more than one exists... no roles will be created`,
          );
        }
      } else {
        this.logger.warn(
          `Roles already exist in the database... no roles will be created`,
        );
      }
    }
  }
}
