import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomUserRole, Tenant, User } from '../../entities';
import { RoleType } from '../../entities/role/types/default-role.enum';
import { AuthType } from '../../entities/user/types/auth-type.enum';
import { UserStatus } from '../../entities/user/types/user-status.enum';
import { generateRandomNumber, hashPassword } from '@saas-buildkit/crypto';

@Injectable()
export class UserSeedService {
  private readonly logger = new Logger(UserSeedService.name);

  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(CustomUserRole)
    private customUserRoleRepository: Repository<CustomUserRole>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (count === 0) {
      const tenants = await this.tenantRepository.find({
        take: 2,
      });

      if (tenants.length === 1) {
        const tenant = tenants[0];

        const password = generateRandomNumber(8).toString();

        const role = await this.customUserRoleRepository.findOne({
          where: {
            roleType: RoleType.ADMIN,
            tenantId: tenant.id,
          },
        });

        if (!role) {
          this.logger.error(
            `Admin role not found in the database... no user created`,
          );
          return;
        }

        const user = await this.repository.save(
          this.repository.create({
            email: 'john.doe@softkit.dev',
            firstName: 'John',
            lastName: 'Doe',
            authType: AuthType.LOCAL,
            status: UserStatus.ACTIVE,
            roles: [role],
            tenantId: tenant.id,
            password: await hashPassword(password),
          }),
        );

        this.logger.warn(`User created: ${user.email} / ${password}`);
      } else {
        this.logger.warn(
          `Tenants not found in the database or more than one exists... no user created`,
        );
      }
    } else {
      this.logger.warn(
        `Users already exist in the database... not user created`,
      );
    }
  }
}
