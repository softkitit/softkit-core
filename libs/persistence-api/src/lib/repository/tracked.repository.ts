import { BaseTrackedEntity } from '../entity/base-tracked.entity';
import { LimitOptions } from './vo/limit-options.interface';

export interface ITrackedRepository<
  ENTITY extends BaseTrackedEntity,
  ID extends keyof ENTITY,
  FIND_OPTIONS,
> {
  findAllWithArchived(
    opt: FIND_OPTIONS,
    limitOptions?: LimitOptions,
  ): Promise<ENTITY[]>;

  archive(criteria: ENTITY[ID]): Promise<boolean>;
  archive(criteria: Array<ENTITY[ID]>): Promise<boolean>;

  restore(criteria: ENTITY[ID]): Promise<boolean>;
  restore(criteria: Array<ENTITY[ID]>): Promise<boolean>;
}
