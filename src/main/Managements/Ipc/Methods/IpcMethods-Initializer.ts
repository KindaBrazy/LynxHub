import {spawn} from 'node:child_process';

import {ipcMain} from 'electron';

import {initChannels} from '../../../../cross/IpcChannelAndTypes';

export function listenToInitChannels() {
  ipcMain.handle(initChannels.checkGitInstalled, () => {
    return new Promise((resolve, reject) => {
      const commandProcess = spawn('git', ['--version']);
      commandProcess.stdout.on('data', data => {
        const versionParts = data.toString().trim().split(' ');
        resolve(`V${versionParts.slice(2).join('.').trim()}`);
      });

      commandProcess.on('error', err => {
        console.error('Failed to check version: ', err);
        reject(undefined);
      });
      commandProcess.stderr.on('data', data => {
        console.error('Failed to check version: ', data);
        reject(undefined);
      });
    });
  });
  ipcMain.handle(initChannels.checkPwsh7Installed, () => {
    return new Promise((resolve, reject) => {
      // Use 'pwsh' to specifically target PowerShell 7+
      const commandProcess = spawn('pwsh', ['--version']);

      commandProcess.stdout.on('data', data => {
        // Expected output is something like "PowerShell 7.4.1"
        const output = data.toString().trim();
        const versionParts = output.split(' ');
        if (versionParts.length >= 2 && versionParts[0] === 'PowerShell') {
          const version = versionParts[1];
          // Ensure it's version 7 or higher
          if (version.startsWith('7.')) {
            resolve(`V${version}`);
          } else {
            // It's a version of pwsh, but not 7
            reject(undefined);
          }
        } else {
          reject(undefined);
        }
      });

      commandProcess.on('error', err => {
        // This 'error' event fires if the 'pwsh' command cannot be found.
        console.error('Failed to start pwsh. Is PowerShell 7 installed and in PATH?', err);
        reject(undefined);
      });

      commandProcess.stderr.on('data', data => {
        console.error('Error checking pwsh version: ', data.toString());
        reject(undefined);
      });
    });
  });
}
