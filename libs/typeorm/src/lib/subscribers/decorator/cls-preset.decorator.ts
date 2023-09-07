import defaultClsMetadataStore from '../cls-preset.metadata.storage';
import { PresetType } from './vo/preset-type';
import { getMetadataArgsStorage } from 'typeorm';
import { TenantClsStore } from '../../vo/tenant-base-cls-store';

interface ClsPresetDecoratorOptions<CLS_STORE extends TenantClsStore> {
  clsPropertyFieldName: keyof CLS_STORE;
  presetType?: PresetType;
}

export function ClsPreset<CLS_STORE extends TenantClsStore>(
  options: ClsPresetDecoratorOptions<CLS_STORE>,
  // eslint-disable-next-line @typescript-eslint/ban-types
): Function {
  return function (object: object, propertyName: string) {
    const metadataArgsStorage = getMetadataArgsStorage();

    const foundProperty = metadataArgsStorage.columns.find(
      (c) => c.propertyName === propertyName,
    );

    if (foundProperty === undefined) {
      // I don't really know how is it possible to get there
      /* istanbul ignore next */
      throw `Can not find a property for cls preset functionality. Trying to find ${propertyName}, available properties: [${metadataArgsStorage.columns
        .map((c) => c.propertyName)
        .join(',')}]`;
    }

    if (foundProperty) {
      defaultClsMetadataStore.addField({
        entityPropertyName: propertyName,
        entityName:
          foundProperty.target instanceof Function
            ? foundProperty.target.name
            : foundProperty.target,
        clsStorageKey: options.clsPropertyFieldName as symbol,
        presetType: options.presetType || PresetType.ALL,
      });
    }
  };
}
