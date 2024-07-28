import { PresetType } from './vo/preset-type';
import { TenantClsStore } from './vo/tenant-base-cls-store';

export interface ClsPresetMetadataField<
  CLS_STORAGE_TYPE extends TenantClsStore,
> {
  entityName: string;
  entityPropertyName: string;
  clsStorageKey: keyof CLS_STORAGE_TYPE;
  presetType: PresetType;
}

export class ClsPresetMetadataStorage<CLS_STORAGE_TYPE extends TenantClsStore> {
  private metadataFields: {
    [key: string]: ClsPresetMetadataField<CLS_STORAGE_TYPE>[];
  } = {};

  private metadataFieldsForHierarchy: {
    [key: string]: ClsPresetMetadataField<CLS_STORAGE_TYPE>[];
  } = {};

  addField(field: ClsPresetMetadataField<CLS_STORAGE_TYPE>) {
    const fields = this.metadataFields[field.entityName] || [];
    fields.push(field);

    this.metadataFields[field.entityName] = fields;
  }

  getMetadataFieldsByEntityHierarchy(
    topLevelEntity: string,
    entities: string[],
  ) {
    const result = this.metadataFieldsForHierarchy[topLevelEntity];

    if (result === undefined) {
      const fieldToAutoFill = entities.flatMap(
        (e) => this.metadataFields[e] || [],
      );

      this.metadataFieldsForHierarchy[topLevelEntity] = fieldToAutoFill;

      return fieldToAutoFill;
    }

    return result;
  }
}

export const defaultClsMetadataStore = new ClsPresetMetadataStorage();
