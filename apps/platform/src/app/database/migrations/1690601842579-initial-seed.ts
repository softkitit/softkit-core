import { MigrationInterface, QueryRunner } from 'typeorm';
import { hashPassword } from '@saas-buildkit/crypto';

export class InitialSeed1690601842579 implements MigrationInterface {
  ADMIN_USER_EMAIL = 'john.doe-admin@softkit.dev';
  REGULAR_USER_EMAIL = 'john.doe-regular@softkit.dev';
  TENANT_ID = 'facade00-0000-4000-a000-000000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO permission_categories (
          name, description, created_at, updated_at, version)
       VALUES ('Roles Management', 'Roles management for users', now(), now(), 1)`,
    );

    await queryRunner.query(
      `INSERT INTO permissions (
          name, description, action, permission_category_id, created_at, updated_at, version)
       VALUES ('Read Roles', 'Ability to see roles', 'platform.roles.read',
               (select id from permission_categories where lower(name) = 'roles management'),
               now(), now(), 1)`,
    );

    await queryRunner.query(
      `INSERT INTO roles (
                           name, description, role_type, created_at, updated_at, version)
       VALUES ('Admin Role', 'Default not editable Admin Role, with all permissions', 'ADMIN', now(), now(), 1)`,
    );

    await queryRunner.query(
      `INSERT INTO
    roles (
          name, description, role_type, created_at, updated_at, version)
       VALUES ('Regular User Role', 'Default editable Regular User Role', 'REGULAR_USER', now(), now(), 1)`,
    );

    await queryRunner.query(
      `
      insert into user_roles_permissions (role_id, permission_id)
      select (select id from roles where lower(name) = 'admin role'), id from permissions
      `,
    );

    // this id will be useful for other services, that's why we have a memorable version of it
    const password = Math.random().toString(10).slice(-8);
    const hashedPassword = hashPassword(password);

    // eslint-disable-next-line no-console
    console.log(`------------------------PASSWORD------------------------`);
    // eslint-disable-next-line no-console
    console.log(`------------------------${password}------------------------`);
    // eslint-disable-next-line no-console
    console.log(`------------------------PASSWORD------------------------`);

    await queryRunner.query(`
        INSERT INTO tenants (
                             id, tenant_name,
                             tenant_url, created_at,
                             updated_at, version)
        values (
                   '${this.TENANT_ID}',
                   'Softkit',
                   'localhost:9999',
                   now(),
                   now(),
                   0
                );
    `);

    const defaultRoles = await queryRunner.query(`
         select
           id,
           role_type
         from
           roles
         where tenant_id is null
    `);

    // eslint-disable-next-line unicorn/no-array-reduce
    const rolesByTypes = defaultRoles.reduce((acc, role) => {
      acc[role.role_type] = role.id;
      return acc;
    }, {});

    // create user for the above tenant
    const savedAdminUser = await queryRunner.query(`
        INSERT INTO users (id, email, first_name, last_name, auth_type, status, tenant_id, password, created_at,
                                 updated_at, version)
        values (
                 uuid_generate_v4(),
                 '${this.ADMIN_USER_EMAIL}',
                 'John Admin',
                 'Doe',
                 'LOCAL',
                 'ACTIVE',
                 '${this.TENANT_ID}',
                 '${hashedPassword}',
                 now(),
                 now(),
                0
               ) returning id`);

    await queryRunner.query(`
        INSERT INTO users_roles (user_id, role_id)
        values (
                  '${savedAdminUser[0].id}',
                  '${rolesByTypes.ADMIN}'
                )`);

    const savedRegularUser = await queryRunner.query(`
        INSERT INTO users (id, email, first_name, last_name, auth_type, status, tenant_id, password, created_at,
                                 updated_at, version)
        values (
                 uuid_generate_v4(),
                 '${this.REGULAR_USER_EMAIL}',
                 'John Regular',
                 'Doe',
                 'LOCAL',
                 'ACTIVE',
                 '${this.TENANT_ID}',
                 '${hashedPassword}',
                 now(),
                 now(),
                0
               ) returning id`);

    await queryRunner.query(`
        INSERT INTO users_roles (user_id, role_id)
        values (
                  '${savedRegularUser[0].id}',
                  '${rolesByTypes.REGULAR_USER}'
                )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.clearTable('permissions');
    await queryRunner.clearTable('permission_categories');
    await queryRunner.clearTable('user_roles_permissions');
    await queryRunner.clearTable('roles');

    // delete roles
    await queryRunner.query(`
        DELETE FROM user_roles
        WHERE user_id IN (
                           SELECT id
                           FROM users
                           WHERE email IN (
                                            '${this.ADMIN_USER_EMAIL}',
                                            '${this.REGULAR_USER_EMAIL}'
                                          ))`);

    //   delete users and tenant
    await queryRunner.query(`
        DELETE FROM users
        WHERE email IN (
        '${this.ADMIN_USER_EMAIL}',
        '${this.REGULAR_USER_EMAIL}'
        )`);

    await queryRunner.query(`
        DELETE FROM tenants
        WHERE id = '${this.TENANT_ID}'
    `);
  }
}
