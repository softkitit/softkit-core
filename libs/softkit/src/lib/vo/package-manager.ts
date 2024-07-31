export type PackageManagerType = 'npm' | 'yarn' | 'pnpm' | 'bun';

export interface PackageManager {
  type: PackageManagerType;
  version: string;
}
