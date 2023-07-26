import { MigrationInterface, QueryRunner } from 'typeorm';

/* istanbul ignore next */
export class defaultrolesandpermissions1689720037450
  implements MigrationInterface
{
  name = 'defaultrolesandpermissions1689720037450';

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
      `INSERT INTO default_roles (
                           name, description, role_type, created_at, updated_at, version)
       VALUES ('Admin Role', 'Default not editable Admin Role, with all permissions', 'ADMIN', now(), now(), 1)`,
    );

    await queryRunner.query(
      `INSERT INTO default_roles (
          name, description, role_type, created_at, updated_at, version)
       VALUES ('Regular User Role', 'Default editable Regular User Role', 'REGULAR_USER', now(), now(), 1)`,
    );

    await queryRunner.query(
      `
      insert into default_roles_permissions (role_id, permission_id)
      select (select id from default_roles where lower(name) = 'admin role'), id from permissions
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.clearTable('permissions');
    await queryRunner.clearTable('permission_categories');
    await queryRunner.clearTable('default_roles_permissions');
    await queryRunner.clearTable('default_roles');
  }
}
