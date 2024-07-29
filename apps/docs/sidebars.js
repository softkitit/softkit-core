/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  baseSidebar: [
    {
      type: 'category',
      label: 'Introduction',
      link: {
        type: 'doc',
        id: 'intro',
      },
      items: ['intro', 'intro/general-information'],
    },
    // {
    //   type: 'category',
    //   label: 'How To',
    //   link: {
    //     type: 'doc',
    //     id: 'how-to/index',
    //   },
    //   items: [],
    // },
    {
      type: 'category',
      label: 'Available Features',
      link: {
        type: 'doc',
        id: 'features/index',
      },
      items: [
        {
          type: 'category',
          label: 'Code Generators',
          link: {
            type: 'doc',
            id: 'features/code-generators/index',
          },
          items: [
            // 'features/code-generators/microservice-generator',
            // 'features/code-generators/library-generator',
            // 'features/code-generators/service-generator',
            'features/code-generators/backend-client-generator',
          ],
        },
        // 'features/error-handling',
        // 'features/localization',
      ],
    },
    {
      type: 'category',
      label: 'Library Documentation',
      link: {
        type: 'doc',
        id: 'libraries/index',
      },
      items: [
        {
          type: 'category',
          label: 'Async Storage Library',
          link: {
            type: 'doc',
            id: 'libraries/async-storage/getting-started',
          },
          items: [
            'libraries/async-storage/getting-started',
            'libraries/async-storage/advanced-setup',
            {
              type: 'doc',
              label: 'API',
              id: 'api/async-storage/src/index',
            },
          ],
        },
        {
          type: 'category',
          label: 'Bootstrap Library',
          link: {
            type: 'doc',
            id: 'libraries/bootstrap/getting-started',
          },
          items: [
            'libraries/bootstrap/getting-started',
            {
              type: 'doc',
              label: 'API',
              id: 'api/bootstrap/src/index',
            },
          ],
        },
        {
          type: 'category',
          label: 'Common Types Library',
          link: {
            type: 'doc',
            id: 'libraries/common-types/getting-started',
          },
          items: [
            'libraries/common-types/getting-started',
            {
              type: 'doc',
              label: 'API',
              id: 'api/common-types/src/index',
            },
          ],
        },
        {
          type: 'category',
          label: 'Config Library',
          link: {
            type: 'doc',
            id: 'libraries/config/getting-started',
          },
          items: [
            'libraries/config/getting-started',
            'libraries/config/features',
            'libraries/config/structure-example',
            {
              type: 'doc',
              label: 'API',
              id: 'api/config/src/index',
            },
          ],
        },
        {
          type: 'category',
          label: 'Crypto Library',
          link: {
            type: 'doc',
            id: 'libraries/crypto/getting-started',
          },
          items: [
            'libraries/crypto/getting-started',
            {
              type: 'doc',
              label: 'API',
              id: 'api/crypto/src/index',
            },
          ],
        },
        {
          type: 'category',
          label: 'Eslint Backend Library',
          link: {
            type: 'doc',
            id: 'libraries/eslint-backend/getting-started',
          },
          items: [
            'libraries/eslint-backend/getting-started',
            'libraries/eslint-backend/features',
          ],
        },
        {
          type: 'category',
          label: 'Exceptions Library',
          link: {
            type: 'doc',
            id: 'libraries/exceptions/getting-started',
          },
          items: [
            'libraries/exceptions/getting-started',
            {
              type: 'doc',
              label: 'API',
              id: 'api/exceptions/src/index',
            },
          ],
        },
        {
          type: 'category',
          label: 'File Storage Library',
          link: {
            type: 'doc',
            id: 'libraries/file-storage/getting-started',
          },
          items: [
            'libraries/file-storage/getting-started',
            'libraries/file-storage/localstack',
            'libraries/file-storage/advanced-features',
            {
              type: 'doc',
              label: 'API',
              id: 'api/file-storage/src/index',
            },
          ],
        },
        {
          type: 'category',
          label: 'Health Check Library',
          link: {
            type: 'doc',
            id: 'libraries/health-check/getting-started',
          },
          items: [
            'libraries/health-check/getting-started',
            {
              type: 'doc',
              label: 'API',
              id: 'api/health-check/src/index',
            },
          ],
        },
        {
          type: 'category',
          label: 'I18n Library',
          link: {
            type: 'doc',
            id: 'libraries/i18n/getting-started',
          },
          items: [
            'libraries/i18n/getting-started',
            'libraries/i18n/quick-start',
            {
              type: 'category',
              label: 'Guides',
              items: [
                'libraries/i18n/guides/type-safety',
                'libraries/i18n/guides/fallback-languages',
                'libraries/i18n/guides/array',
                'libraries/i18n/guides/debugging',
                {
                  type: 'category',
                  label: 'DTO Validation',
                  items: [
                    'libraries/i18n/guides/dto_validation/global-validation',
                    'libraries/i18n/guides/dto_validation/manual-validation',
                  ],
                },
                'libraries/i18n/guides/exception-filters',
                'libraries/i18n/guides/formatting',
                'libraries/i18n/guides/graphql',
                'libraries/i18n/guides/grpc',
                'libraries/i18n/guides/guard',
                'libraries/i18n/guides/mailer',
                'libraries/i18n/guides/nested',
                'libraries/i18n/guides/plurals',
                {
                  type: 'category',
                  label: 'View engines',
                  items: [
                    'libraries/i18n/guides/view_engines/ejs',
                    'libraries/i18n/guides/view_engines/handlebars',
                    'libraries/i18n/guides/view_engines/pug',
                  ],
                },
              ],
            },
            {
              type: 'category',
              label: 'Concepts',
              items: [
                'libraries/i18n/concepts/i18n-context',
                'libraries/i18n/concepts/loader',
                'libraries/i18n/concepts/resolver',
              ],
            },
            {
              type: 'category',
              label: 'FAQ',
              items: ['libraries/i18n/faq/common'],
            },
            {
              type: 'doc',
              label: 'API',
              id: 'api/i18n/src/index',
            },
          ],
        },
        {
          type: 'category',
          label: 'Logger Library',
          link: {
            type: 'doc',
            id: 'libraries/logger/getting-started',
          },
          items: [
            'libraries/logger/getting-started',
            'libraries/logger/configuration',
            {
              type: 'doc',
              label: 'API',
              id: 'api/logger/src/index',
            },
          ],
        },
        {
          type: 'category',
          label: 'Mail Library',
          link: {
            type: 'doc',
            id: 'libraries/mail/getting-started',
          },
          items: [
            'libraries/mail/getting-started',
            'libraries/mail/configuration',
            'libraries/mail/usage',
            {
              type: 'doc',
              label: 'API',
              id: 'api/mail/src/index',
            },
          ],
        },
        {
          type: 'category',
          label: 'Redis Library',
          link: {
            type: 'doc',
            id: 'libraries/redis/getting-started',
          },
          items: [
            'libraries/redis/getting-started',
            'libraries/redis/configuration',
            'libraries/redis/features',
            {
              type: 'doc',
              label: 'API',
              id: 'api/redis/src/index',
            },
          ],
        },
        {
          type: 'category',
          label: 'Resource Plugin Library',
          link: {
            type: 'doc',
            id: 'libraries/resource-plugin/getting-started',
          },
          items: [
            'libraries/resource-plugin/getting-started',
            'libraries/resource-plugin/usage',
            {
              type: 'doc',
              label: 'API',
              id: 'api/resource-plugin/src/index',
            },
          ],
        },
        {
          type: 'category',
          label: 'String Utils Library',
          link: {
            type: 'doc',
            id: 'libraries/string-utils/getting-started',
          },
          items: [
            'libraries/string-utils/getting-started',
            'libraries/string-utils/features',
            {
              type: 'doc',
              label: 'API',
              id: 'api/string-utils/src/index',
            },
          ],
        },
        {
          type: 'category',
          label: 'Swagger Utils Library',
          link: {
            type: 'doc',
            id: 'libraries/swagger-utils/getting-started',
          },
          items: [
            'libraries/swagger-utils/getting-started',
            'libraries/swagger-utils/advanced-configuration',
            {
              type: 'doc',
              label: 'API',
              id: 'api/swagger-utils/src/index',
            },
          ],
        },
        {
          type: 'category',
          label: 'Test Utils Library',
          link: {
            type: 'doc',
            id: 'libraries/test-utils/getting-started',
          },
          items: [
            'libraries/test-utils/getting-started',
            'libraries/test-utils/features',
            'libraries/test-utils/test-containers',
            {
              type: 'doc',
              label: 'API',
              id: 'api/test-utils/src/index',
            },
          ],
        },
        {
          type: 'category',
          label: 'Typeorm Library',
          link: {
            type: 'doc',
            id: 'libraries/typeorm/getting-started',
          },
          items: [
            'libraries/typeorm/getting-started',
            'libraries/typeorm/auto-populating-fields',
            'libraries/typeorm/data-pagination',
            'libraries/typeorm/default-exclusion-lists',
            'libraries/typeorm/optimistic-locking',
            'libraries/typeorm/snake-naming-strategy',
            'libraries/typeorm/transaction-management',
            {
              type: 'link',
              label: 'Usage',
              href: 'https://github.com/softkitit/softkit-core/tree/main/libs/typeorm/src/__tests__/app',
            },
            {
              type: 'doc',
              label: 'API',
              id: 'api/typeorm/src/index',
            },
          ],
        },
        {
          type: 'category',
          label: 'Typeorm Service Library',
          link: {
            type: 'doc',
            id: 'libraries/service-api/getting-started',
          },
          items: [
            'libraries/service-api/getting-started',
            'libraries/service-api/base-entity-service',
            'libraries/service-api/base-tenant-entity-service',
            {
              type: 'doc',
              label: 'API',
              id: 'api/service-api/src/index',
            },
          ],
        },
        {
          type: 'category',
          label: 'Validation Library',
          link: {
            type: 'doc',
            id: 'libraries/validation/getting-started',
          },
          items: [
            'libraries/validation/getting-started',
            'libraries/validation/transforms-and-decorators',
            {
              type: 'doc',
              label: 'API',
              id: 'api/validation/src/index',
            },
          ],
        },
      ],
    },

    // {
    //   type: 'category',
    //   label: 'About Softkit',
    //   link: {
    //     type: 'doc',
    //     id: 'about/index',
    //   },
    //   items: ['about/licensing', 'about/product-roadmap'],
    // },
    // {
    //   type: 'category',
    //   label: 'FAQ',
    //   link: {
    //     type: 'doc',
    //     id: 'faq/index',
    //   },
    //   items: [],
    // },
    {
      type: 'category',
      label: 'API Documentation',
      link: {
        type: 'doc',
        id: 'api/index',
      },
      items: [
        {
          type: 'doc',
          label: 'Async Storage',
          id: 'api/async-storage/src/index',
        },
        {
          type: 'doc',
          label: 'Auth',
          id: 'api/auth/src/index',
        },
        {
          type: 'doc',
          label: 'Bootstrap',
          id: 'api/bootstrap/src/index',
        },
        {
          type: 'doc',
          label: 'Platform Client',
          id: 'api/clients/platform-client/src/index',
        },
        {
          type: 'doc',
          label: 'Common Types',
          id: 'api/common-types/src/index',
        },
        {
          type: 'doc',
          label: 'Config',
          id: 'api/config/src/index',
        },
        {
          type: 'doc',
          label: 'Crypto',
          id: 'api/crypto/src/index',
        },
        {
          type: 'doc',
          label: 'Exceptions',
          id: 'api/exceptions/src/index',
        },
        {
          type: 'doc',
          label: 'File Storage',
          id: 'api/file-storage/src/index',
        },
        {
          type: 'doc',
          label: 'Health Check',
          id: 'api/health-check/src/index',
        },
        {
          type: 'doc',
          label: 'I18n',
          id: 'api/i18n/src/index',
        },
        {
          type: 'doc',
          label: 'Logger',
          id: 'api/logger/src/index',
        },
        {
          type: 'doc',
          label: 'Mail',
          id: 'api/mail/src/index',
        },
        {
          type: 'doc',
          label: 'Redis',
          id: 'api/redis/src/index',
        },
        {
          type: 'doc',
          label: 'Resource Plugin',
          id: 'api/resource-plugin/src/index',
        },
        {
          type: 'doc',
          label: 'Server HTTP Client',
          id: 'api/server-http-client/src/index',
        },
        {
          type: 'doc',
          label: 'String Utils',
          id: 'api/string-utils/src/index',
        },
        {
          type: 'doc',
          label: 'Swagger Utils',
          id: 'api/swagger-utils/src/index',
        },
        {
          type: 'doc',
          label: 'Test Utils',
          id: 'api/test-utils/src/index',
        },
        {
          type: 'doc',
          label: 'TypeORM',
          id: 'api/typeorm/src/index',
        },
        {
          type: 'doc',
          label: 'Typeorm Service',
          id: 'api/service-api/src/index',
        },
        {
          type: 'doc',
          label: 'Validation',
          id: 'api/validation/src/index',
        },
      ],
    },
  ],
};

module.exports = sidebars;
