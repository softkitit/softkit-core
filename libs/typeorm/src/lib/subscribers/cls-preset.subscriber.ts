import defaultClsMetadataStore from './cls-preset.metadata.storage';
import { PresetType } from './decorator/vo/preset-type';
import { Injectable } from '@nestjs/common';
import { ClsService, ClsStore } from "nestjs-cls";
import {
  DataSource,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { TenantClsStore } from "../vo/tenant-base-cls-store";

@Injectable()
export class ClsPresetSubscriber<ClsStoreType extends TenantClsStore> implements EntitySubscriberInterface {
  constructor(
    private readonly dataSource: DataSource,
    private readonly clsService: ClsService<ClsStoreType>,
  ) {
    dataSource.subscribers.push(this);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeInsert(event: InsertEvent<any>): Promise<any> | void {
    this.handleEntityChangeEvent(
      event.metadata.inheritanceTree,
      event.entity,
      PresetType.INSERT,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeUpdate(event: UpdateEvent<any>) {
    this.handleEntityChangeEvent(
      event.metadata.inheritanceTree,
      event.entity,
      PresetType.UPDATE,
    );
  }

  private handleEntityChangeEvent(
    // eslint-disable-next-line @typescript-eslint/ban-types
    inheritanceTree: Function[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entity: any,
    presetType: PresetType,
  ) {
    const topLevelEntity = inheritanceTree[0].name;
    const allEntities = inheritanceTree.map((e) => e.name);

    const metadataFields =
      defaultClsMetadataStore.getMetadataFieldsByEntitiesHierarchy(
        topLevelEntity,
        allEntities,
      );

    for (const field of metadataFields) {
      if (
        presetType === field.presetType ||
        field.presetType === PresetType.ALL
      ) {
        entity[field.entityPropertyName] =
          this.clsService.get()[field.clsStorageKey];
      }
    }
  }
}
