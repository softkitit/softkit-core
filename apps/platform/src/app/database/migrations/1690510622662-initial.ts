import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1510690622662 implements MigrationInterface {
  name = 'Initial1510690622662';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tenants" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_url" character varying NOT NULL, "tenant_name" character varying(1024) NOT NULL, CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d8430dfceae97e9231af81dc21" ON "tenants" ("tenant_url") WHERE "tenant_url" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "permission_categories" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(512) NOT NULL, "description" character varying(1024) NOT NULL, CONSTRAINT "PK_74d37787e3657c0a4f38501fd8c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permissions" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(512) NOT NULL, "description" character varying(1024) NOT NULL, "action" character varying NOT NULL, "permission_category_id" uuid NOT NULL, CONSTRAINT "UQ_1c1e0637ecf1f6401beb9a68abe" UNIQUE ("action"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."roles_role_type_enum" AS ENUM('ADMIN', 'REGULAR_USER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(512) NOT NULL, "description" character varying(1024) NOT NULL, "role_type" "public"."roles_role_type_enum" NOT NULL, "tenant_id" uuid, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2ffeea26579b427afa17b0a1bf" ON "roles" ("tenant_id") WHERE "deleted_at" IS NOT NULL`,
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
      `CREATE TABLE "user_roles_permissions" ("role_id" uuid NOT NULL, "permission_id" uuid NOT NULL, CONSTRAINT "PK_f14c467261057c9963c1cb0025b" PRIMARY KEY ("role_id", "permission_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_196638fa4ae8b458527eaf1e7d" ON "user_roles_permissions" ("role_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5114c23669f9b3ce2ec00ae0ca" ON "user_roles_permissions" ("permission_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users_roles" ("user_id" uuid NOT NULL, "role_id" uuid NOT NULL, CONSTRAINT "PK_c525e9373d63035b9919e578a9c" PRIMARY KEY ("user_id", "role_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e4435209df12bc1f001e536017" ON "users_roles" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1cf664021f00b9cc1ff95e17de" ON "users_roles" ("role_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "FK_7e41ca1f8d46cafff6d16388cec" FOREIGN KEY ("permission_category_id") REFERENCES "permission_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_e59a01f4fe46ebbece575d9a0fc" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "user_roles_permissions" ADD CONSTRAINT "FK_196638fa4ae8b458527eaf1e7d4" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles_permissions" ADD CONSTRAINT "FK_5114c23669f9b3ce2ec00ae0ca4" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_roles" ADD CONSTRAINT "FK_e4435209df12bc1f001e5360174" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_roles" ADD CONSTRAINT "FK_1cf664021f00b9cc1ff95e17de4" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_roles" DROP CONSTRAINT "FK_1cf664021f00b9cc1ff95e17de4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_roles" DROP CONSTRAINT "FK_e4435209df12bc1f001e5360174"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles_permissions" DROP CONSTRAINT "FK_5114c23669f9b3ce2ec00ae0ca4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles_permissions" DROP CONSTRAINT "FK_196638fa4ae8b458527eaf1e7d4"`,
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
      `ALTER TABLE "roles" DROP CONSTRAINT "FK_e59a01f4fe46ebbece575d9a0fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP CONSTRAINT "FK_7e41ca1f8d46cafff6d16388cec"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1cf664021f00b9cc1ff95e17de"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e4435209df12bc1f001e536017"`,
    );
    await queryRunner.query(`DROP TABLE "users_roles"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5114c23669f9b3ce2ec00ae0ca"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_196638fa4ae8b458527eaf1e7d"`,
    );
    await queryRunner.query(`DROP TABLE "user_roles_permissions"`);
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
      `DROP INDEX "public"."IDX_2ffeea26579b427afa17b0a1bf"`,
    );
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TYPE "public"."roles_role_type_enum"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "permission_categories"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d8430dfceae97e9231af81dc21"`,
    );
    await queryRunner.query(`DROP TABLE "tenants"`);
  }
}
