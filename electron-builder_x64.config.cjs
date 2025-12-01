const baseConfig = require('./electron-builder.base.config.cjs');

/** @type {import('electron-builder').Configuration} */
module.exports = {
  ...baseConfig,
  win: {
    target: [{target: 'nsis', arch: 'x64'}],
  },
  linux: {
    ...baseConfig.linux,
    target: [
      {target: 'deb', arch: 'x64'},
      {target: 'rpm', arch: 'x64'},
      {target: 'tar.gz', arch: 'x64'},
    ],
  },
  mac: {
    ...baseConfig.mac,
    target: [
      {target: 'dmg', arch: 'x64'},
      {target: 'zip', arch: 'x64'},
    ],
  },
};
