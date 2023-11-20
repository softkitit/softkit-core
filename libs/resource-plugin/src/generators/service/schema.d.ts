export interface ServiceGeneratorSchema {
  projectName: string;
  serviceName: string;
  repositoryName: string;
  entityName: string;
  groupName: string;
  tenantBaseService: boolean;
  lintCommandName?: string;
}
