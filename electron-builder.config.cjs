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
    '!extension/*',
    '!readme/*',
    '!electron.vite.config.{js,ts,mjs,cjs}',
    '!electron-builder.config.{js,ts,mjs,cjs}',
    '!{.eslintcache,eslint.config.js,.prettierignore,.prettierrc.yaml}',
    '!{.env,.env.*,.npmrc,pnpm-lock.yaml,.prettierrc.json,.ncurc.json,postcss.config.cjs,tailwind.config.js}',
    '!{tsconfig.json,tsconfig.node.json,tsconfig.web.json,dev-app-update.yml,CHANGELOG.md,README.md}',
    '!{notifications.json,notifications.schema.json,releases_log.json}',
    '!{releases_log_v2.json,releases_log_v2.schema.json}',
  ],
  asarUnpack: ['resources/**'],
  npmRebuild: false,
  artifactName: '${productName}-V${version}-${os}_${arch}.${ext}',
  win: {
    target: [
      {target: 'nsis', arch: ['x64', 'arm64']},
      {target: 'portable', arch: ['x64', 'arm64']},
    ],
  },
  portable: {artifactName: '${productName}-V${version}-${os}-Portable_${arch}.${ext}'},
  appImage: {artifactName: '${productName}-V${version}-${os}-Portable_${arch}.${ext}'},
  nsis: {
    artifactName: '${productName}-V${version}-${os}_${arch}-Setup.${ext}',
    shortcutName: '${productName}',
    uninstallDisplayName: '${productName}',
    oneClick: false,
    perMachine: true,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: 'always',
  },
  linux: {
    target: [
      {target: 'deb', arch: ['x64', 'arm64']},
      {target: 'rpm', arch: ['x64', 'arm64']},
      {target: 'tar.gz', arch: ['x64', 'arm64']},
      {target: 'AppImage', arch: ['x64', 'arm64']},
    ],
    synopsis: 'Manage AI interfaces from a single platform.',
    description:
      'LynxHub is an open-source AI management software that lets you seamlessly install, configure, launch, and' +
      ' manage AI interfaces from a single, intuitive platform.',
    category: 'ArtificialIntelligence',
    executableArgs: ['--no-sandbox'],
  },
  mac: {
    artifactName: '${productName}-V${version}-${os}_${arch}.${ext}',
    icon: 'build/icon-darwin.png',
    entitlementsInherit: 'build/entitlements.mac.plist',
    extendInfo: {
      NSDocumentsFolderUsageDescription: 'LynxHub uses the Documents folder to store application data.',
    },
    notarize: false,
    target: [
      {target: 'dmg', arch: ['x64', 'arm64']},
      {target: 'zip', arch: ['x64', 'arm64']},
    ],
  },
  publish: {
    provider: 'github',
  },
};

module.exports = config;
