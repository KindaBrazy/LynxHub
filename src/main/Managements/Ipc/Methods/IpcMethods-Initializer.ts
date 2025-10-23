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
      // Flag to ensure the promise is only settled once.
      let isSettled = false;

      // Use 'pwsh' to specifically target PowerShell 7+
      const commandProcess = spawn('pwsh', ['--version']);

      commandProcess.stdout.on('data', data => {
        if (isSettled) return;

        const output = data.toString().trim();
        // Expected output is something like "PowerShell 7.4.1"
        const versionParts = output.split(' ');
        if (versionParts.length >= 2 && versionParts[0] === 'PowerShell') {
          const version = versionParts[1];
          // Ensure it's version 7 or higher
          if (version.startsWith('7.')) {
            isSettled = true;
            resolve(`V${version}`);
          } else {
            isSettled = true;
            // It's a version of pwsh, but not 7. Reject with a clear message.
            reject(new Error(`Found PowerShell version ${version}, but version 7 is required.`));
          }
        }
        // If output is unexpected, we'll let the 'close' event handle the rejection.
      });

      // This 'error' event fires if the 'pwsh' command cannot be started.
      commandProcess.on('error', err => {
        if (isSettled) return;
        isSettled = true;

        console.error('Failed to start pwsh. Is PowerShell 7 installed and in PATH?', err.message);
        // Reject with a clear error message.
        reject(new Error('PowerShell 7 (pwsh) was not found in your system PATH.'));
      });

      commandProcess.stderr.on('data', data => {
        // Log stderr for debugging, but don't reject here. Let the 'close' event handle it
        // based on the exit code, as some programs write warnings to stderr on success.
        console.error('stderr from pwsh check:', data.toString());
      });

      // The 'close' event fires when the process has exited.
      commandProcess.on('close', code => {
        if (isSettled) return;
        isSettled = true;

        // If we reach this point, it means stdout did not resolve the promise.
        // This is considered a failure. The exit code gives a hint as to why.
        console.log(`pwsh process exited with code ${code}.`);
        reject(
          new Error(`The PowerShell 7 check failed. The 'pwsh' command exited without providing a valid version.`),
        );
      });
    });
  });
}
