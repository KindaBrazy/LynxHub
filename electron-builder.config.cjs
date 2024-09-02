/** @type {import('electron-builder').Configuration} */
const config = {
  appId: 'ai.kindabrazy.lynxhub',
  electronLanguages: 'en-US',
  directories: {
    buildResources: 'build',
  },
  files: [
    '!**/.vscode/*',
    '!src/*',
    '!dist/*',
    '!electron.vite.config.{js,ts,mjs,cjs}',
    '!electron-builder.config.{js,ts,mjs,cjs}',
    '!{.eslintignore,.eslintrc.cjs,eslint.config.js,.prettierignore,.prettierrc.yaml}',
    '!{.env,.env.*,.npmrc,pnpm-lock.yaml,.prettierrc.json,.ncurc.json,postcss.config.cjs,tailwind.config.js}',
    '!{tsconfig.json,tsconfig.node.json,tsconfig.web.json,dev-app-update.yml,CHANGELOG.md,README.md}',
  ],
  asarUnpack: ['resources/**'],
  npmRebuild: false,
  nsis: {
    artifactName: '${productName}-V${version}-${os}_${arch}-Setup.${ext}',
    shortcutName: '${productName}',
    uninstallDisplayName: '${productName}',
    oneClick: false,
    perMachine: true,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: 'always',
  },
  artifactName: '${productName}-V${version}-${os}_${arch}.${ext}',
  linux: {
    target: [
      {target: 'deb', arch: ['x64', 'arm64']},
      {target: 'rpm', arch: ['x64', 'arm64']},
      {target: 'tar.gz', arch: ['x64', 'arm64']},
    ],
    synopsis: 'Manage AI interfaces from a single platform.',
    description:
      'LynxHub is an open-source AI management software that lets you seamlessly install, configure, launch, and' +
      ' manage AI interfaces from a single, intuitive platform.',
    category: 'ArtificialIntelligence',
    executableArgs: ['--no-sandbox'],
  },
  publish: {
    provider: 'github',
  },
};

module.exports = config;
