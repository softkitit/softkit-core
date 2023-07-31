export interface ResourceGeneratorSchema {
  projectName: string;
  entityName: string;
  groupName?: string;
  tenantBaseEntity: boolean;
  generateRepository: boolean;
}
