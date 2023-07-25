import { PresetType } from './decorator/vo/preset-type';
import { ClsStore } from "nestjs-cls";
import { TenantClsStore } from "../vo/tenant-base-cls-store";

interface ClsPresetMetadataField<CLS_STORAGE_TYPE extends TenantClsStore> {
  entityName: string;
  entityPropertyName: string;
  clsStorageKey: keyof CLS_STORAGE_TYPE;
  presetType: PresetType;
}

class ClsPresetMetadataStorage<CLS_STORAGE_TYPE extends TenantClsStore> {
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

  getMetadataFieldsByEntitiesHierarchy(
    topLevelEntity: string,
    entities: string[],
  ) {
    // eslint-disable-next-line security/detect-object-injection

    // eslint-disable-next-line security/detect-object-injection
    const result = this.metadataFieldsForHierarchy[topLevelEntity];

    if (result === undefined) {
      const fieldToAutoFill = entities.flatMap(
        // eslint-disable-next-line security/detect-object-injection
        (e) => this.metadataFields[e] || [],
      );

      // eslint-disable-next-line security/detect-object-injection
      this.metadataFieldsForHierarchy[topLevelEntity] = fieldToAutoFill;

      return fieldToAutoFill;
    }

    return result;
  }
}



const defaultClsMetadataStore = new ClsPresetMetadataStorage();

export default defaultClsMetadataStore;
