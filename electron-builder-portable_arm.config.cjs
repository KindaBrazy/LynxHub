const baseConfig = require('./electron-builder.base.config.cjs');

/** @type {import('electron-builder').Configuration} */
module.exports = {
  ...baseConfig,
  win: {
    target: [{target: 'portable', arch: 'arm64'}],
  },
  portable: {artifactName: '${productName}-V${version}-${os}-Portable_${arch}.${ext}'},
  appImage: {artifactName: '${productName}-V${version}-${os}-Portable_${arch}.${ext}'},
  linux: {
    ...baseConfig.linux,
    target: [{target: 'AppImage', arch: 'arm64'}],
  },
};
