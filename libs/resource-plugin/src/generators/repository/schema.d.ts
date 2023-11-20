export interface RepositoryGeneratorSchema {
  projectName: string;
  repositoryName: string;
  entityName: string;
  groupName: string;
  tenantBaseRepository: boolean;
  lintCommandName?: string;
}
