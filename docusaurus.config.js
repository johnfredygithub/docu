/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */
// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
const {configEnv} = require('./config/config.js');
/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'DEVPEDIA',
  tagline: 'Tutoriales y documentación sobre desarrollo',
  favicon: 'img/favicon.svg',

  // Set the production url of your site here
  url: 'https://react.johnfredy.email/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'John Fredy', // Usually your GitHub org/user name.
  projectName: 'documentation', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  /* ___________________________________________NAV__________________________________ */
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/johnfredygithub',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/johnfredygithub',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      algolia: {
        // The application ID provided by Algolia
        appId: `${configEnv.APPLICATION_ID}`,
        // Public API key: it is safe to commit it
        apiKey: `${configEnv.API_KEY}`,
        indexName: 'demo1',
        // Optional: see doc section below
        contextualSearch: true,
      },
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: '',
        logo: {
          alt: 'My Project Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Tutorial',
          },
          {to: 'blog', label: 'Blog', position: 'left'},
          // Please keep GitHub link to the right for consistency.
          {
            href: 'https://github.com/johnfredygithub',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },

      /* ____________FOOTER__________________________________________________ */
      footer: {
        style: 'dark',
        links: [
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: 'blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/johnfredygithub',
              },
            ],
          },
        ],
        logo: {
          alt: 'Open Source Logo',
          // This default includes a positive & negative version, allowing for
          // appropriate use depending on your site's style.
          src: `img/contact_address_book_icon.png`,
          href: 'https://opensource.fb.com',
        },
        // Please do not remove the credits, help to publicize Docusaurus :)
        copyright: `Copyright © ${new Date().getFullYear()} ,Nos reservamos los derechos de autor.`,
      },
    }),
};

module.exports = config;
