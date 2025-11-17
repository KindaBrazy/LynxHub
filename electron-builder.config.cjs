/** @type {import('electron-builder').Configuration} */
const config = {
  appId: 'ai.kindabrazy.lynxhub',
  electronLanguages: 'en-US',
  directories: {
    buildResources: 'build',
  },
  files: [
    '!**/.vscode/*',
    '!**/.windsurf/*',
    '!src/*',
    '!dist/*',
    '!extension/*',
    '!module/*',
    '!readme/*',
    '!electron.vite.config.{js,ts,mjs,cjs}',
    '!electron-builder.config.{js,ts,mjs,cjs}',
    '!electron-builder-portable.config.{js,ts,mjs,cjs}',
    '!electron-builder-test.config.{js,ts,mjs,cjs}',
    '!{.eslintcache,eslint.config.js,.prettierignore,.prettierrc.yaml}',
    '!{.env,.env.*,.npmrc,pnpm-lock.yaml,.prettierrc.json,.ncurc.json,postcss.config.cjs,tailwind.config.js}',
    '!{tsconfig.json,tsconfig.node.json,tsconfig.web.json,dev-app-update.yml,CHANGELOG.md,README.md}',
    '!{MoveChanges.ts}',
    '!{.sentryclirc,MoveModule_Compiled.js,removeDotExtensions.js}',
  ],
  asarUnpack: ['resources/**'],
  npmRebuild: false,
  artifactName: '${productName}-V${version}-${os}_${arch}.${ext}',
  win: {
    target: [{target: 'nsis', arch: ['x64', 'arm64']}],
  },
  nsis: {
    artifactName: '${productName}-V${version}-${os}_${arch}-Setup.${ext}',
    shortcutName: '${productName}',
    uninstallDisplayName: '${productName}',
    oneClick: false,
    perMachine: true,
    allowToChangeInstallationDirectory: true,
    buildUniversalInstaller: false,
    createDesktopShortcut: 'always',
  },
  linux: {
    target: [
      {target: 'deb', arch: ['x64', 'arm64']},
      {target: 'rpm', arch: ['x64', 'arm64']},
      {target: 'tar.gz', arch: ['x64', 'arm64']},
    ],
    synopsis: 'Cross-platform, extensible terminal/browser for AI management.',
    description:
      'Open-source, cross-platform terminal and browser, designed for managing AI. Highly modular and extensible,' +
      " it's the all-in-one environment for AI power users.",
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
