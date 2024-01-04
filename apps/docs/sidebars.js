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
    {
      type: 'category',
      label: 'How To',
      link: {
        type: 'doc',
        id: 'how-to/index',
      },
      items: [],
    },
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
            'features/code-generators/microservice-generator',
            'features/code-generators/library-generator',
            'features/code-generators/service-generator',
            'features/code-generators/backend-client-generator',
          ],
        },
        'features/error-handling',
        'features/localization',
      ],
    },
    {
      type: 'category',
      label: 'Library Documentation',
      items: [
        {
          type: 'category',
          label: 'Mail Library',
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
      ],
    },
    {
      type: 'category',
      label: 'About Softkit',
      link: {
        type: 'doc',
        id: 'about/index',
      },
      items: ['about/licensing', 'about/product-roadmap'],
    },
    {
      type: 'category',
      label: 'FAQ',
      link: {
        type: 'doc',
        id: 'faq/index',
      },
      items: [],
    },
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
          id: 'api/typeorm-service/src/index',
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
