import { MigrationInterface, QueryRunner } from 'typeorm';
import { RoleType } from '../entities/roles/types/default-role.enum';
import { Logger } from '@nestjs/common';

export class RecurringRoles implements MigrationInterface {
  name = 'RecurringRoles1687682172344';
  private readonly logger = new Logger('RecurringRoles');

  public async up(queryRunner: QueryRunner): Promise<void> {
    const rolesByType = await this.extractAndCreateNewRoles(queryRunner);

    await this.extractAndCreatePermissionsWithCategories(
      queryRunner,
      rolesByType,
    );
  }

  private async extractAndCreatePermissionsWithCategories(
    queryRunner: QueryRunner,
    allRoles: Record<RoleType, Role>,
  ) {
    const permissionsFromFile = await this.loadPermissionsFromFile();

    const allRolesIds = Object.values(allRoles).map((role) => role.id);

    const allPermissions = await this.loadPermissionsFromDb(queryRunner);

    const allRolesPermissions = await this.loadRolePermissionsFromDb(
      allRolesIds,
      queryRunner,
    );

    await this.createPermissionsCategoriesIfDoesntExist(
      queryRunner,
      permissionsFromFile,
    );

    for (const category of Object.values(permissionsFromFile)) {
      for (const permissionsKey in category.permissions) {
        // eslint-disable-next-line security/detect-object-injection
        const permission = category.permissions[permissionsKey];

        const dbPermission = allPermissions[permission.action];
        delete allPermissions[permission.action];

        if (dbPermission) {
          permission.id = dbPermission.id;
        } else {
          const [{ id: permissionId }] = await queryRunner.query(
            `INSERT INTO "permissions" ("name",
                              "description",
                              "action",
                              "permission_category_id",
                              "version")
         VALUES ('${permission.name}',
                 '${permission.description}',
                 '${permission.action}',
                 '${category.id}',
                 0)
         RETURNING id
        `,
          );

          permission.id = permissionId;
          this.logger.log(`New permission, with ${permission.action} created`);
        }
        await this.handleUserRolesPermissions(
          permission,
          allRoles,
          allRolesPermissions,
          queryRunner,
        );
      }
    }

    if (allPermissions.length > 0) {
      this.logger.warn(
        `We do not do automatic deletion. Permissions to delete: ${Object.values(
          allPermissions,
        ).map((r) => JSON.stringify(r, undefined, 2))}`,
      );
    }

    if (allRolesPermissions.length > 0) {
      this.logger.warn(
        `We do not do automatic deletion. Role permissions to delete: ${Object.values(
          allRolesPermissions,
        ).map((r) => JSON.stringify(r, undefined, 2))}`,
      );
    }
  }

  private async handleUserRolesPermissions(
    permission: Permission,
    allRoles: Record<RoleType, Role>,
    allRolesPermissions,
    queryRunner: QueryRunner,
  ) {
    for (const roleType of permission.roles) {
      // eslint-disable-next-line security/detect-object-injection
      const role = allRoles[roleType];

      if (!role) {
        throw new Error(
          `Role '${roleType}' does not exist, it looks like a typo, please check the permissions.json file, and roles.json file`,
        );
      }

      const rolePermission = allRolesPermissions[role.id + permission.id];

      if (rolePermission) {
        delete allRolesPermissions[role.id + permission.id];
      } else {
        await queryRunner.query(
          `INSERT INTO "user_roles_permissions" ("role_id",
                              "permission_id")
         VALUES ('${role.id}',
                 '${permission.id}')
        `,
        );
      }
    }
  }

  private async createPermissionsCategoriesIfDoesntExist(
    queryRunner: QueryRunner,
    permissionsFromFile: Record<string, PermissionCategoryGrouped>,
  ) {
    const allPermissionCategories =
      await this.getAllPermissionCategories(queryRunner);

    for (const [permissionCategoryName, permissionCategory] of Object.entries(
      permissionsFromFile,
    )) {
      const permissionCategoryFromDb =
        // eslint-disable-next-line security/detect-object-injection
        allPermissionCategories[permissionCategoryName];

      // eslint-disable-next-line security/detect-object-injection
      delete allPermissionCategories[permissionCategoryName];

      if (permissionCategoryFromDb) {
        permissionCategory.id = permissionCategoryFromDb.id;
      } else {
        const [{ id: permissionCategoryId }] = await queryRunner.query(
          `INSERT INTO "permission_categories" ("name",
                              "description",
                              "version")
         VALUES ('${permissionCategory.categoryName}',
                 '${permissionCategory.categoryDescription}',
                 0)
         RETURNING id
        `,
        );
        permissionCategory.id = permissionCategoryId;
        this.logger.log(
          `New permission category, with ${permissionCategoryName} created`,
        );
      }
    }

    if (Object.keys(allPermissionCategories).length > 0) {
      this.logger.warn(
        `We do not do automatic deletion. Permission categories to delete: ${Object.values(
          allPermissionCategories,
        ).map((r) => JSON.stringify(r, undefined, 2))}`,
      );
    }
  }

  private async extractAndCreateNewRoles(queryRunner: QueryRunner) {
    const rolesFromFile = await this.loadRolesFromFile();
    const allRoles = await this.loadRolesFromDb(queryRunner);

    const rolesFilled = Object.entries(rolesFromFile).map(
      async ([roleType, role]) => {
        // eslint-disable-next-line security/detect-object-injection
        const roleFromDb = allRoles[roleType];
        // eslint-disable-next-line security/detect-object-injection
        delete allRoles[roleType];

        if (roleFromDb) {
          role.id = roleFromDb.id;
        } else {
          const [{ id: roleId }] = await queryRunner.query(
            `INSERT INTO "roles" ("name",
                              "description",
                              "role_type",
                              "version")
         VALUES ('${role.name}',
                 '${role.description}',
                 '${roleType}',
                 0)
         RETURNING id
        `,
          );

          role.id = roleId;

          this.logger.log(`New role, with ${roleType} created`);
        }
      },
    );

    await Promise.all(rolesFilled);

    const rolesToDelete = Object.values(allRoles);

    if (rolesToDelete.length > 0) {
      this.logger.warn(
        `We do not do deletes for safety, all deletes must be explicit. Roles to delete: ${rolesToDelete.map(
          (r) => `${JSON.stringify(r, undefined, 2)}`,
        )}`,
      );
    }

    return rolesFromFile;
  }

  private async loadPermissionsFromDb(queryRunner: QueryRunner) {
    const permissions = await queryRunner.query(
      `
      select * from "permissions"
      `,
    );

    // eslint-disable-next-line unicorn/no-array-reduce
    return permissions.reduce((acc, permission) => {
      acc[permission.action] = permission;
      return acc;
    }, {});
  }

  private async loadRolePermissionsFromDb(
    defaultRoleIds: string[],
    queryRunner: QueryRunner,
  ) {
    if (defaultRoleIds.length === 0) {
      return {};
    }

    const rolePermissions = await queryRunner.query(
      `
      select * from "user_roles_permissions"
      where role_id IN (${defaultRoleIds
        .map((_, idx) => `$${idx + 1}`)
        .join(',')})
      `,
      defaultRoleIds,
    );

    // eslint-disable-next-line unicorn/no-array-reduce
    return rolePermissions.reduce((acc, permission) => {
      acc[permission.role_id + permission.permission_id] = permission;
      return acc;
    }, {});
  }

  private async getAllPermissionCategories(queryRunner: QueryRunner) {
    const permissionCategories = await queryRunner.query(
      `
      select * from "permission_categories"
      `,
    );

    // eslint-disable-next-line unicorn/no-array-reduce
    return permissionCategories.reduce((acc, category) => {
      acc[category.name.toLowerCase()] = category;
      return acc;
    }, {});
  }

  private async loadRolesFromDb(queryRunner: QueryRunner) {
    const roles = await queryRunner.query(
      `select * from "roles" where role_type is not null`,
    );

    // eslint-disable-next-line unicorn/no-array-reduce
    return roles.reduce((acc, role) => {
      acc[role.roleType] = role;
      return acc;
    }, {});
  }

  private async loadPermissionsFromFile() {
    const permissions = await import(
      '../../assets/migrations/permissions.json'
    );

    const categoriesWithPermissions =
      permissions.default as never as PermissionCategory[];

    const permissionsDuplicate = [];
    const categoriesDuplicate = [];

    // eslint-disable-next-line unicorn/no-array-reduce
    const categoriesTransformed = categoriesWithPermissions.reduce(
      (acc, category) => {
        // eslint-disable-next-line unicorn/no-array-reduce
        const permissionsByAction = category.permissions.reduce(
          (acc, permission) => {
            permission.action = permission.action.toLowerCase();

            if (acc[permission.action]) {
              permissionsDuplicate.push(permission.action);
            }
            acc[permission.action] = permission;
            return acc;
          },
          {} as Record<string, Permission>,
        );

        if (permissionsDuplicate.length > 0) {
          throw new Error(
            `Duplicate permission action found in category ${category.categoryName}, duplicate actions: ${permissionsDuplicate}`,
          );
        }

        const categoryNameLowerCase = category.categoryName.toLowerCase();

        if (acc[category.categoryName]) {
          categoriesDuplicate.push(categoryNameLowerCase);
        }

        // eslint-disable-next-line security/detect-object-injection
        acc[categoryNameLowerCase] = {
          categoryName: category.categoryName,
          categoryDescription: category.categoryDescription,
          permissions: permissionsByAction,
        };
        return acc;
      },
      {} as Record<string, PermissionCategoryGrouped>,
    );

    if (categoriesDuplicate.length > 0) {
      throw new Error(
        `Duplicate permission category found: ${categoriesDuplicate}`,
      );
    }

    return categoriesTransformed;
  }

  private async loadRolesFromFile() {
    const rolesLoaded = await import('../../assets/migrations/roles.json');

    const roles = rolesLoaded.default as never as Role[];

    const duplicateRoleType = [];

    // eslint-disable-next-line unicorn/no-array-reduce
    const rolesGrouped = roles.reduce(
      (acc, role) => {
        if (acc[role.roleType]) {
          duplicateRoleType.push(role.roleType);
        }
        acc[role.roleType] = role;
        return acc;
      },
      {} as Record<RoleType, Role>,
    );

    if (duplicateRoleType.length > 0) {
      throw new Error(
        `Duplicate role action found, roleType should be unique. Please check roles.json file. ${duplicateRoleType}`,
      );
    }

    return rolesGrouped;
  }

  public async down(): Promise<void> {}
}

interface Role {
  id?: string;
  name: string;
  description: string;
  roleType: string;
}

interface Permission {
  id?: string;
  name: string;
  description: string;
  action: string;
  roles: RoleType[];
}

interface PermissionCategoryBase {
  id?: string;
  categoryName: string;
  categoryDescription: string;
}

interface PermissionCategory extends PermissionCategoryBase {
  permissions: Permission[];
}

interface PermissionCategoryGrouped extends PermissionCategoryBase {
  permissions: PermissionsByAction;
}

type PermissionsByAction = Record<string, Permission>;
