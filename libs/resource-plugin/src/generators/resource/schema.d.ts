export interface ResourceGeneratorSchema {
  projectName: string;
  entityName: string;
  basePath: string;
  groupName: string;
  tenantBaseEntity: boolean;
  generateRepository: boolean;
  generateService: boolean;
  generateController: boolean;
  lintCommandName?: string;
}
