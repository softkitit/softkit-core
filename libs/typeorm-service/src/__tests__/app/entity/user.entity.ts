import { Column, Entity, PrimaryGeneratedColumn, VersionColumn } from 'typeorm';
import { BaseEntityHelper } from '@softkit/typeorm';
import { FilterOperator, PaginateConfig } from 'nestjs-paginate';
import { FilterSuffix } from 'nestjs-paginate/lib/filter';
import { IsNumberLocalized } from '@softkit/validation';
import { Expose } from 'class-transformer';

@Entity()
export class UserEntity extends BaseEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // having it nullable is useful for set password later logic
  @Column({ nullable: true, length: 256 })
  password?: string;

  @Column({ type: String, nullable: false, length: 128 })
  firstName!: string;

  @Column({ type: String, nullable: false, length: 128 })
  lastName!: string;

  @Column({ type: String, nullable: true, length: 128 })
  nullableStringField?: string | null;

  @Column({ type: String, nullable: true, length: 128 })
  notFilterable?: string | null;

  @VersionColumn()
  @IsNumberLocalized()
  @Expose()
  version!: number;
}

export const PAGINATED_CONFIG: PaginateConfig<UserEntity> = {
  filterableColumns: {
    firstName: true,
    lastName: [
      FilterSuffix.NOT,
      FilterOperator.EQ,
      FilterOperator.IN,
      FilterOperator.NULL,
      FilterOperator.GT,
      FilterOperator.GTE,
      FilterOperator.LT,
      FilterOperator.LTE,
      FilterOperator.BTW,
      FilterOperator.ILIKE,
      FilterOperator.SW,
      FilterOperator.CONTAINS,
    ],
    password: [FilterSuffix.NOT, FilterOperator.NULL],
    nullableStringField: [
      FilterOperator.ILIKE,
      FilterOperator.SW,
      FilterOperator.CONTAINS,
    ],
    createdAt: [
      FilterOperator.LT,
      FilterOperator.LTE,
      FilterOperator.GT,
      FilterOperator.GTE,
    ],
  },
  sortableColumns: ['id', 'createdAt'],
  defaultSortBy: [['createdAt', 'DESC']],
  defaultLimit: 10,
  maxLimit: 100,
};
