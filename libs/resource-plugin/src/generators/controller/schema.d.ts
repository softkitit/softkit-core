export interface ControllerGeneratorSchema {
  projectName: string;
  controllerName: string;
  basePath: string;
  serviceName: string;
  entityName: string;
  tenantBaseEntity: boolean;
  entityIncludesIdField?: boolean;
  entityIncludesVersionField?: boolean;
  groupName: string;
  lintCommandName?: string;
}
