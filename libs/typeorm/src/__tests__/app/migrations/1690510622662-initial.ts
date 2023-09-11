import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1510690622662 implements MigrationInterface {
  name = 'Initial1510690622662';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "created_in_migration"
       (
           "created_at" TIMESTAMP NOT NULL DEFAULT now(),
           "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
           "deleted_at" TIMESTAMP,
           "version"    integer   NOT NULL,
           "id"         uuid      PRIMARY KEY NOT NULL
       )`,
    );
  }

  /* istanbul ignore next */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "created_in_migration"`);
  }
}
