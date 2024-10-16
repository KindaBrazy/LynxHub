import http from 'node:http';
import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import {ipcMain} from 'electron';
import fs from 'graceful-fs';
import portFinder from 'portfinder';
import handler from 'serve-handler';

import {getAppDataPath} from './AppDataManager';

let finalAddress: string;
let finalPort = 5103;
const finalHost = 'localhost';
let server: ReturnType<typeof http.createServer> | undefined = undefined;
let extensionPath: string;
let extensionsAddress: string[] = [];

async function writeConfig() {
  return new Promise<void>(async resolve => {
    try {
      const files = fs.readdirSync(extensionPath, {withFileTypes: true});
      const folders = files.filter(file => file.isDirectory()).map(folder => folder.name);

      extensionsAddress = folders.map(folder => `${finalAddress}/${folder}`);

      const extensionsFolder = folders.map(folder => path.join(extensionPath, folder));

      const importedModules = await Promise.all(
        extensionsFolder.map(
          modulePath => import(`file://${path.join(modulePath, 'scripts', 'main', 'mainEntry.mjs')}`),
        ),
      );

      importedModules.forEach(importedModule => {
        importedModule.default();
      });

      resolve();
    } catch (error: any) {
      console.error('Loading Module Error: ', error);
      resolve();
    }
  });
}

export default async function serveExtensions() {
  extensionPath = path.join(getAppDataPath(), 'extensions');

  ipcMain.handle('extension-address', () => {
    return finalAddress;
  });
  ipcMain.handle('extension-address-data', () => {
    return extensionsAddress;
  });

  portFinder.getPortPromise({port: finalPort}).then(async (port: number) => {
    finalPort = port;
    server = http.createServer((req, res) => {
      try {
        const origin = is.dev ? '*' : 'file://';
        res.setHeader('Access-Control-Allow-Origin', origin);
        return handler(req, res, {
          public: extensionPath,
        });
      } catch (handlerError) {
        console.error('Error in request handler:', handlerError);
        res.statusCode = 500;
        res.end('Internal Server Error');
        return;
      }
    });

    server.on('error', serverError => {
      console.error('Server error:', serverError);
    });

    server.listen(finalPort, finalHost, async () => {
      try {
        finalAddress = `http://${finalHost}:${finalPort}`;
        await writeConfig();
      } catch (configError) {
        console.error('Error writing config:', configError);
        server?.close();
      }
    });
  });
}
