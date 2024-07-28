import { BaseTrackedEntityHelper, EntityHelper } from '../../index';

export const DEFAULT_ENTITY_EXCLUDE_LIST = [
  'hasId',
  'setEntityName',
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
] as Array<keyof BaseTrackedEntityHelper>;

export const DEFAULT_UPDATE_ENTITY_EXCLUDE_LIST = [
  ...DEFAULT_ENTITY_EXCLUDE_LIST,
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
] as Array<keyof EntityHelper | 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
