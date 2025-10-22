import {spawn} from 'node:child_process';

import {ipcMain} from 'electron';

import {initChannels} from '../../../../cross/IpcChannelAndTypes';

export function listenToInitChannels() {
  ipcMain.handle(initChannels.checkGitInstalled, () => {
    return new Promise((resolve, reject) => {
      const commandProcess = spawn('git', ['--version']);

      let stdoutData = '';

      commandProcess.on('error', err => {
        console.error('Failed to start git process. Is Git installed and in your PATH?', err);

        reject('Git is not installed or could not be found in the system PATH.');
      });

      commandProcess.stdout.on('data', data => {
        stdoutData += data.toString();
      });

      commandProcess.stderr.on('data', data => {
        console.error(`stderr: ${data}`);
      });

      commandProcess.on('close', code => {
        if (code !== 0) {
          console.error(`git process exited with error code ${code}`);
          reject(`Git process exited with error code: ${code}`);
          return;
        }

        if (stdoutData) {
          const versionString = stdoutData.trim();
          const versionParts = versionString.split(' ');

          if (versionParts.length >= 3) {
            resolve(versionParts[2]);
          } else {
            resolve(versionString);
          }
        } else {
          reject('Git command ran successfully but produced no output.');
        }
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
