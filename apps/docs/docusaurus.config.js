// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

/** @type {import("@docusaurus/types").Config} */
const config = {
  title: 'Softkit Docs',
  tagline:
    'Softkit makes it easy to build modern applications with the best developer experience.',
  favicon: 'img/favicon.ico',
  trailingSlash: true,

  // Set the production url of your site here
  url: 'https://docs.softkit.dev',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'throw',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'uk'],
  },
  markdown: {
    format: 'detect',
  },
  plugins: [
    'plugin-image-zoom',
    [
      'docusaurus-plugin-typedoc',
      {
        out: 'apps/docs/docs/api',
      },
    ],
    [
      '@docusaurus/plugin-ideal-image',
      {
        quality: 70,
        max: 1030, // max resized image's size.
        min: 640, // min resized image's size. if original is lower, use that size.
        steps: 2, // the max number of images generated between min and max (inclusive)
        disableInDev: false,
      },
    ],
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: '/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.module.css'),
        },
      },
    ],
  ],

  themeConfig:
    /** @type {import("@docusaurus/preset-classic").ThemeConfig} */
    ({
      algolia: {
        appId: 'PLYJTXZHRK',
        apiKey: '1f0cfa6c5336592be3c6691fb17bb9bf',
        indexName: 'softkit',
        contextualSearch: true,
      },
      navbar: {
        title: '',
        hideOnScroll: false,
        logo: {
          alt: 'Softkit',
          src: 'img/logo.svg',
          href: 'https://softkit.dev/',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'baseSidebar',
            position: 'left',
            label: 'Getting Started',
            activeBaseRegex: '^/$',
          },
          // {
          //   to: '/faq',
          //   position: 'left',
          //   label: 'FAQ',
          // },
          {
            href: 'https://github.com/softkitit/softkit-core',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Instagram',
                href: 'https://www.instagram.com/softkitit/',
              },
              {
                label: 'Facebook',
                href: 'https://www.facebook.com/SoftkitIT/',
              },
              {
                label: 'LinkedIn',
                href: 'https://linkedin.com/company/softkitit',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/softkitit',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: 'https://www.softkit.dev/blog/',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/softkitit/softkit-core',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Softkit OU`,
      },
      docs: {
        sidebar: {
          autoCollapseCategories: true,
          hideable: true,
        },
      },
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
    }),
};

module.exports = config;
