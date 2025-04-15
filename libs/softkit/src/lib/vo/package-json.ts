export interface PackageJson {
  // Generic Package.Json Configuration
  name: string;
  version: string;
  license?: string;
  private?: boolean;
  scripts?: Record<string, string>;
  type?: 'module' | 'commonjs';
  main?: string;
  types?: string;
  module?: string;
  exports?:
    | string
    | Record<
        string,
        string | { types?: string; require?: string; import?: string }
      >;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional: boolean }>;
  resolutions?: Record<string, string>;
  bin?: Record<string, string> | string;
  workspaces?:
    | string[]
    | {
        packages: string[];
      };
  publishConfig?: Record<string, string>;

  sk?: {
    generators?: Record<string, string>;
    /**
     * key is a plugin name from package.json
     * value is an object with default values for the generator, useful for do not repeat yourself
     * for things like:
     *   - i18n default languages
     *   - db default ORM
     *   - testing default setup
     */
    defaultGeneratorOptions?: Record<string, object>;
  };

  packageManager?: string;
  description?: string;
  keywords?: string[];
}
