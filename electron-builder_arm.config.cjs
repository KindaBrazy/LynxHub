const baseConfig = require('./electron-builder.base.config.cjs');

/** @type {import('electron-builder').Configuration} */
module.exports = {
  ...baseConfig,
  win: {
    target: [{target: 'nsis', arch: 'arm64'}],
  },
  linux: {
    ...baseConfig.linux,
    target: [
      {target: 'deb', arch: 'arm64'},
      {target: 'rpm', arch: 'arm64'},
      {target: 'tar.gz', arch: 'arm64'},
    ],
  },
  mac: {
    ...baseConfig.mac,
    target: [
      {target: 'dmg', arch: 'arm64'},
      {target: 'zip', arch: 'arm64'},
    ],
  },
};
