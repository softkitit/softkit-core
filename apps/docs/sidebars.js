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
        type: "doc",
        id: "intro",
      },
      items: [
        "intro",
        "intro/general-information"
      ],
    },
    {
      type: 'category',
      label: 'How To',
      link: {
        type: "doc",
        id: "how-to/index",
      },
      items: [
      ],
    },
    {
      type: 'category',
      label: 'Available Features',
      link: {
        type: "doc",
        id: "features/index",
      },
      items: [
        {
          type: "category",
          label: "Code Generators",
          link: {
            type: "doc",
            id: "features/code-generators/index",
          },
          items: [
            "features/code-generators/microservice-generator",
            "features/code-generators/library-generator",
            "features/code-generators/service-generator",
            "features/code-generators/backend-client-generator",
          ]
        },
        "features/error-handling",
        "features/localization"
      ],
    },
    {
      type: 'category',
      label: 'About Softkit',
      link: {
        type: "doc",
        id: "about/index",
      },
      items: [
        'about/licensing',
        'about/product-roadmap',
      ],
    },
    {
      type: 'category',
      label: 'FAQ',
      link: {
        type: "doc",
        id: "faq/index",
      },
      items: [
      ],
    },


  ],


};

module.exports = sidebars;
