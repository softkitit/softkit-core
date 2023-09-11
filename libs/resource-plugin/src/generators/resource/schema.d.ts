export interface ResourceGeneratorSchema {
  projectName: string;
  entityName: string;
  groupName: string;
  tenantBaseEntity: boolean;
  generateRepository: boolean;
  generateService: boolean;
  generateController: boolean;
  lintCommandName?: string;
}
