import { getMetadataArgsStorage } from 'typeorm';
import { BaseTrackedEntityHelper } from '../../entity/entity-helper';
import {
  defaultClsMetadataStore,
  PresetType,
  TenantClsStore,
} from '@softkit/persistence-api';

interface ClsPresetDecoratorOptions<CLS_STORE extends TenantClsStore> {
  clsFieldName: keyof CLS_STORE;
  presetType?: PresetType;
}

export function ClsPreset<CLS_STORE extends TenantClsStore>(
  options: ClsPresetDecoratorOptions<CLS_STORE>,
  // eslint-disable-next-line @typescript-eslint/ban-types
): Function {
  return function (object: object, propertyName: string) {
    const metadataArgsStorage = getMetadataArgsStorage();

    if (!(object instanceof BaseTrackedEntityHelper)) {
      throw new TypeError(
        `Cls Preset functionality is available only for instances of BaseEntityHelper class`,
      );
    }

    const entityName = object.constructor.name;

    const foundProperty = metadataArgsStorage.columns.find(
      (c) => c.propertyName === propertyName,
    );

    /* istanbul ignore next */
    if (foundProperty === undefined) {
      // I don't really know how is it possible to get there
      throw `Can not find a property for cls preset functionality. Trying to find ${propertyName}, available properties: [${metadataArgsStorage.columns
        .map((c) => c.propertyName)
        .join(',')}]`;
    }

    defaultClsMetadataStore.addField({
      entityPropertyName: propertyName,
      entityName,
      clsStorageKey: options.clsFieldName as symbol,
      presetType: options.presetType ?? PresetType.ALL,
    });
  };
}
