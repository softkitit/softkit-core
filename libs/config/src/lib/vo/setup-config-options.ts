import { ClassConstructor } from 'class-transformer';

export interface SetupConfigOptions {
  baseDir: string;
  rootSchemaClass: ClassConstructor<unknown>;
  folderName?: string;
  baseFileName?: string;
  profiles?: string[];
}
