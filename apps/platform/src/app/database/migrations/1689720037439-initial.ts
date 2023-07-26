import { MigrationInterface, QueryRunner } from 'typeorm';

/* istanbul ignore next */
export class initial1689720037439 implements MigrationInterface {
  name = 'initial1689720037439';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "permission_categories" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(512) NOT NULL, "description" character varying(1024) NOT NULL, CONSTRAINT "PK_74d37787e3657c0a4f38501fd8c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permissions" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(512) NOT NULL, "description" character varying(1024) NOT NULL, "action" character varying NOT NULL, "permission_category_id" uuid NOT NULL, CONSTRAINT "UQ_1c1e0637ecf1f6401beb9a68abe" UNIQUE ("action"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."default_roles_role_type_enum" AS ENUM('ADMIN', 'REGULAR_USER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "default_roles" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(512) NOT NULL, "description" character varying(1024) NOT NULL, "role_type" "public"."default_roles_role_type_enum" NOT NULL, CONSTRAINT "UQ_af13aa7f094b1783f995c702c5e" UNIQUE ("role_type"), CONSTRAINT "PK_f3af95c3255c9bb6ab25a0f1f6c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tenants" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_url" character varying NOT NULL, "tenant_name" character varying(1024) NOT NULL, CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d8430dfceae97e9231af81dc21" ON "tenants" ("tenant_url") WHERE "tenant_url" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."custom_roles_role_type_enum" AS ENUM('ADMIN', 'REGULAR_USER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "custom_roles" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, "tenant_id" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(512) NOT NULL, "description" character varying(1024) NOT NULL, "role_type" "public"."custom_roles_role_type_enum" NOT NULL, CONSTRAINT "PK_7b337026aed161643793aad5299" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_228fa43d102da5324b3f993aa4" ON "custom_roles" ("tenant_id") WHERE "deleted_at" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "saml_configuration" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, "tenant_id" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entry_point" character varying(2048) NOT NULL, "certificate" character varying(8192) NOT NULL, "enabled" boolean NOT NULL, CONSTRAINT "REL_0dc0cb1ac3dcdcf2a1816dce6e" UNIQUE ("tenant_id"), CONSTRAINT "PK_f900fe5912c3b5ba442f22e4d06" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7c861d6cb9e998cf7007abb347" ON "saml_configuration" ("tenant_id") WHERE "deleted_at" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('ACTIVE', 'WAITING_FOR_EMAIL_APPROVAL', 'DEACTIVATED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_auth_type_enum" AS ENUM('LOCAL', 'GOOGLE', 'APPLE', 'LINKEDIN', 'GITHUB', 'MICROSOFT', 'SAML_TENANT', 'OPENID_CONNECT_TENANT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying(256), "first_name" character varying(256) NOT NULL, "last_name" character varying(256) NOT NULL, "status" "public"."users_status_enum" NOT NULL, "auth_type" "public"."users_auth_type_enum" NOT NULL, "tenant_id" uuid NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d70680559e044a6413f0b7375d" ON "users" ("email") WHERE "deleted_at" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_94db6de9076d3a8887784d7cd2" ON "users" ("tenant_id") WHERE "deleted_at" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."external_approvals_approval_type_enum" AS ENUM('REGISTRATION', 'PASSWORD_RESET', 'EMAIL_CHANGE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "external_approvals" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "code" character varying(128) NOT NULL, "approval_type" "public"."external_approvals_approval_type_enum" NOT NULL, CONSTRAINT "PK_d04b1fbe8ddf45c6f9973a1e443" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6dd1a8bc9c50f53e45ed30be9a" ON "external_approvals" ("user_id") WHERE "deleted_at" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "default_roles_permissions" ("role_id" uuid NOT NULL, "permission_id" uuid NOT NULL, CONSTRAINT "PK_427f738244c501c18be83262a8b" PRIMARY KEY ("role_id", "permission_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_64aa8c028470714a55d060cf67" ON "default_roles_permissions" ("role_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_572fd48c4421134e82a49b010a" ON "default_roles_permissions" ("permission_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "custom_roles_permissions" ("role_id" uuid NOT NULL, "permission_id" uuid NOT NULL, CONSTRAINT "PK_760fc805910604a02711120e8c4" PRIMARY KEY ("role_id", "permission_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b2d121dd3370c657f6f6bd049f" ON "custom_roles_permissions" ("role_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c9a0da50cf890add3b6c804c03" ON "custom_roles_permissions" ("permission_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_roles" ("user_id" uuid NOT NULL, "role_id" uuid NOT NULL, CONSTRAINT "PK_23ed6f04fe43066df08379fd034" PRIMARY KEY ("user_id", "role_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_87b8888186ca9769c960e92687" ON "user_roles" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b23c65e50a758245a33ee35fda" ON "user_roles" ("role_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "FK_7e41ca1f8d46cafff6d16388cec" FOREIGN KEY ("permission_category_id") REFERENCES "permission_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_roles" ADD CONSTRAINT "FK_170007f21e7a425ec7311660797" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "saml_configuration" ADD CONSTRAINT "FK_0dc0cb1ac3dcdcf2a1816dce6e8" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_109638590074998bb72a2f2cf08" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "external_approvals" ADD CONSTRAINT "FK_a88e27e0d96a1770cc276eee3b4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "default_roles_permissions" ADD CONSTRAINT "FK_64aa8c028470714a55d060cf674" FOREIGN KEY ("role_id") REFERENCES "default_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "default_roles_permissions" ADD CONSTRAINT "FK_572fd48c4421134e82a49b010a7" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_roles_permissions" ADD CONSTRAINT "FK_b2d121dd3370c657f6f6bd049f3" FOREIGN KEY ("role_id") REFERENCES "custom_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_roles_permissions" ADD CONSTRAINT "FK_c9a0da50cf890add3b6c804c039" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "custom_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_roles_permissions" DROP CONSTRAINT "FK_c9a0da50cf890add3b6c804c039"`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_roles_permissions" DROP CONSTRAINT "FK_b2d121dd3370c657f6f6bd049f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "default_roles_permissions" DROP CONSTRAINT "FK_572fd48c4421134e82a49b010a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "default_roles_permissions" DROP CONSTRAINT "FK_64aa8c028470714a55d060cf674"`,
    );
    await queryRunner.query(
      `ALTER TABLE "external_approvals" DROP CONSTRAINT "FK_a88e27e0d96a1770cc276eee3b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_109638590074998bb72a2f2cf08"`,
    );
    await queryRunner.query(
      `ALTER TABLE "saml_configuration" DROP CONSTRAINT "FK_0dc0cb1ac3dcdcf2a1816dce6e8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_roles" DROP CONSTRAINT "FK_170007f21e7a425ec7311660797"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP CONSTRAINT "FK_7e41ca1f8d46cafff6d16388cec"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b23c65e50a758245a33ee35fda"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_87b8888186ca9769c960e92687"`,
    );
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c9a0da50cf890add3b6c804c03"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b2d121dd3370c657f6f6bd049f"`,
    );
    await queryRunner.query(`DROP TABLE "custom_roles_permissions"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_572fd48c4421134e82a49b010a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_64aa8c028470714a55d060cf67"`,
    );
    await queryRunner.query(`DROP TABLE "default_roles_permissions"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6dd1a8bc9c50f53e45ed30be9a"`,
    );
    await queryRunner.query(`DROP TABLE "external_approvals"`);
    await queryRunner.query(
      `DROP TYPE "public"."external_approvals_approval_type_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_94db6de9076d3a8887784d7cd2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d70680559e044a6413f0b7375d"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_auth_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7c861d6cb9e998cf7007abb347"`,
    );
    await queryRunner.query(`DROP TABLE "saml_configuration"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_228fa43d102da5324b3f993aa4"`,
    );
    await queryRunner.query(`DROP TABLE "custom_roles"`);
    await queryRunner.query(`DROP TYPE "public"."custom_roles_role_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d8430dfceae97e9231af81dc21"`,
    );
    await queryRunner.query(`DROP TABLE "tenants"`);
    await queryRunner.query(`DROP TABLE "default_roles"`);
    await queryRunner.query(
      `DROP TYPE "public"."default_roles_role_type_enum"`,
    );
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "permission_categories"`);
  }
}
