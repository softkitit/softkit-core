import { MigrationInterface, QueryRunner } from 'typeorm';

export class DefaultRoles1687682172342 implements MigrationInterface {
  name = 'DefaultRoles1687682172342';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const rolesResponse = await queryRunner.query(
      `INSERT INTO "roles" ("name",
                            "description",
                            "role_type",
                            version)
       VALUES ('App Super Admin',
               'Super admin, usually a company employee. Only super admin can give super admin credentials for others',
               'SUPER_ADMIN',
               0),
              ('User',
               'This is a default role for any added user',
               'REGULAR_USER',
               0),
              ('Platform Admin',
               'full access to all resources',
               'ADMIN',
               0)
       RETURNING id
      `,
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [superAdminId, regularUserId, adminId] = rolesResponse.map(
      (r) => r.id,
    );

    const [rolesPermissionCategoryId] = await queryRunner
      .query(
        `INSERT INTO "permission_categories"
             (name, description, version)
         VALUES ('Roles',
                 'Permissions related to roles management',
                 0)
         RETURNING id
        `,
      )
      .then((arr) => arr.map((r) => r.id));

    const allRolesPermissions = await queryRunner
      .query(
        `INSERT INTO "permissions" ("name",
                                    "description",
                                    "action",
                                    "permission_category_id",
                                    "version")
         VALUES ('Read roles',
                 '',
                 'platform.roles.read',
                 '${rolesPermissionCategoryId}',
                 0),
                ('Create roles',
                 '',
                 'platform.roles.create',
                 '${rolesPermissionCategoryId}',
                 0),
                ('Delete roles',
                 '',
                 'platform.roles.delete',
                 '${rolesPermissionCategoryId}',
                 0),
                ('Update roles',
                 '',
                 'platform.roles.update',
                 '${rolesPermissionCategoryId}',
                 0)
         returning id
        `,
      )
      .then((arr) => arr.map((r) => r.id));

    const allRoles = [adminId, superAdminId].flatMap((roleId) => {
      return allRolesPermissions.map((permissionId) =>
        queryRunner.query(
          `INSERT INTO "user_roles_permissions" ("role_id",
                                                 permission_id)
           values ('${roleId}',
                   '${permissionId}')`,
        ),
      );
    });

    await Promise.all(allRoles);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE
                             FROM "roles"
                             WHERE "role_type" in ('ADMIN', 'SUPER_ADMIN', 'REGULAR_USER')`);
  }
}
