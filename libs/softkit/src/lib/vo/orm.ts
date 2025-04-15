export type OrmType = 'typeorm';

export interface Orm {
  type: OrmType;
  version: string;
  usesForMigrations: boolean;
}
