module.exports = {
  root: true,
  ignorePatterns: ['**/*'],
  plugins: [
    '@nx',
    '@typescript-eslint/eslint-plugin',
    'simple-import-sort',
    'security',
    'sonarjs',
    'jest',
    'unicorn',
    'promise',
  ],
  overrides: [
    {
      files: ['*.json'],
      parser: 'jsonc-eslint-parser',
      rules: {
        '@nx/dependency-checks': 'error',
      },
    },
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      rules: {
        '@nx/enforce-module-boundaries': [
          'error',
          {
            enforceBuildableLibDependency: true,
            allow: [],
            depConstraints: [
              {
                sourceTag: '*',
                onlyDependOnLibsWithTags: ['*'],
              },
            ],
          },
        ],
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'plugin:@nx/typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'plugin:security/recommended',
        'plugin:sonarjs/recommended',
        'plugin:jest/recommended',
        'plugin:unicorn/recommended',
      ],
      env: {
        node: true,
        jest: true,
        'jest/globals': true,
        es2021: true,
      },
      rules: {
        'simple-import-sort/imports': 'off',
        'unicorn/prevent-abbreviations': 'off',
        'unicorn/no-abusive-eslint-disable': 'off',
        'unicorn/no-array-callback-reference': 'off',
        'unicorn/prefer-module': 'off',
        'jest/expect-expect': 'off',
        'unicorn/prefer-top-level-await': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/no-unused-vars': ['error'],
        '@typescript-eslint/no-explicit-any': ['error'],
        'security/detect-object-injection': ['error'],
        'simple-import-sort/exports': 'error',
        'max-len': [
          'error',
          {
            code: 120,
            ignoreTemplateLiterals: true,
            ignoreRegExpLiterals: true,
            ignoreStrings: true,
            ignoreUrls: true,
          },
        ],
        'no-console': ['error'],
        complexity: ['error', 7],
        'spaced-comment': [2, 'always'],
      },
    },
    {
      files: ['*.js', '*.jsx'],
      extends: ['plugin:@nx/javascript'],
      rules: {},
    },
    {
      files: [
        '*.spec.ts',
        '*.spec.tsx',
        '*.spec.js',
        '*.spec.jsx',
        '*-seed*.ts',
        '*/migrations/*',
      ],
      env: {
        jest: true,
      },
      rules: {
        'sonarjs/no-duplicate-string': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'unicorn/no-null': 'off',
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};
