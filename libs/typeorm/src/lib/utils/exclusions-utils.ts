import { BaseEntityHelper, EntityHelper } from '../../index';

export const DEFAULT_ENTITY_EXCLUDE_LIST = [
  '__entity',
  'hasId',
  'setEntityName',
  'toJSON',
  'recover',
  'softRemove',
  'reload',
  'save',
] as Array<keyof EntityHelper>;

export const DEFAULT_CREATE_ENTITY_EXCLUDE_LIST = [
  ...DEFAULT_ENTITY_EXCLUDE_LIST,
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'version',
] as Array<keyof BaseEntityHelper>;

export const DEFAULT_UPDATE_ENTITY_EXCLUDE_LIST = [
  ...DEFAULT_ENTITY_EXCLUDE_LIST,
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
] as Array<keyof BaseEntityHelper>;
