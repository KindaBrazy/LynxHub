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
    '!{notifications.json,notifications.schema.json,releases_log.json,releases_log_v2.json,MoveChanges.ts}',
    '!{releases_log_v2.schema.json,.sentryclirc,}',
  ],
  asarUnpack: ['resources/**'],
  npmRebuild: false,
  artifactName: '${productName}-V${version}-${os}_${arch}.${ext}',
  win: {
    target: [{target: 'portable', arch: ['x64', 'arm64']}],
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
    buildUniversalInstaller: false,
    createDesktopShortcut: 'always',
  },
  linux: {
    target: [{target: 'AppImage', arch: ['x64', 'arm64']}],
    synopsis: 'Cross-platform, extensible terminal/browser for AI management.',
    description:
      'Open-source, cross-platform terminal and browser, designed for managing AI. Highly modular and extensible,' +
      " it's the all-in-one environment for AI power users.",
    category: 'ArtificialIntelligence',
    executableArgs: ['--no-sandbox'],
  },
  publish: {
    provider: 'github',
  },
};

module.exports = config;
