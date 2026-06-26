import {randomUUID} from 'node:crypto';
import {copyFile, mkdir, readFile, stat} from 'node:fs/promises';
import {basename, extname, join} from 'node:path';

import {dialog, OpenDialogOptions, protocol} from 'electron';

import classHolder from './classHolder';
import {getAppDataPath} from './dataFolder';

export class UserImagesManager {
  private readonly userImagesDir: string;
  private initialized = false;

  constructor() {
    this.userImagesDir = join(getAppDataPath(), 'user-images');
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    // Ensure user-images directory exists
    await mkdir(this.userImagesDir, {recursive: true});

    // Register protocol handler
    protocol.handle('lynxlocal', request => this.handleRequest(request));

    this.initialized = true;
  }

  private async handleRequest(request: Request): Promise<Response> {
    try {
      const parsedUrl = new URL(request.url);
      if (parsedUrl.hostname !== 'image') {
        return new Response('Invalid host', {status: 400});
      }

      const filename = parsedUrl.pathname.slice(1);
      if (!filename) {
        return new Response('Missing filename', {status: 400});
      }

      // Prevent directory traversal
      const safeFilename = basename(filename);
      const filePath = join(this.userImagesDir, safeFilename);

      const fileStats = await stat(filePath);
      if (!fileStats.isFile()) {
        return new Response('Not Found', {status: 404});
      }

      const buffer = await readFile(filePath);
      const ext = extname(safeFilename).toLowerCase();
      let mimeType = 'image/png';
      if (ext === '.jpg' || ext === '.jpeg') {
        mimeType = 'image/jpeg';
      } else if (ext === '.gif') {
        mimeType = 'image/gif';
      } else if (ext === '.webp') {
        mimeType = 'image/webp';
      } else if (ext === '.svg') {
        mimeType = 'image/svg+xml';
      } else if (ext === '.bmp') {
        mimeType = 'image/bmp';
      } else if (ext === '.ico') {
        mimeType = 'image/x-icon';
      }

      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Length': String(buffer.length),
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    } catch (error) {
      console.error('[UserImages] Protocol request handling error:', error);
      return new Response('Internal error', {status: 500});
    }
  }

  public async chooseImage(options?: {allowMultiple?: boolean}): Promise<string | string[] | undefined> {
    const dialogOptions: OpenDialogOptions = {
      title: 'Select Image',
      filters: [{name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'ico', 'svg']}],
      properties: options?.allowMultiple ? ['openFile', 'multiSelections'] : ['openFile'],
    };

    const {appManager} = classHolder;
    const mainWindow = appManager?.getMainWindow();
    const result = mainWindow
      ? await dialog.showOpenDialog(mainWindow, dialogOptions)
      : await dialog.showOpenDialog(dialogOptions);

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return options?.allowMultiple ? [] : undefined;
    }

    // Ensure the directory exists (just in case)
    await mkdir(this.userImagesDir, {recursive: true});

    const copiedUrls: string[] = [];
    for (const originalPath of result.filePaths) {
      const ext = extname(originalPath);
      const newFilename = `${randomUUID()}${ext}`;
      const targetPath = join(this.userImagesDir, newFilename);
      await copyFile(originalPath, targetPath);
      copiedUrls.push(`lynxlocal://image/${newFilename}`);
    }

    return options?.allowMultiple ? copiedUrls : copiedUrls[0];
  }
}

// Singleton instance
let userImagesManager: UserImagesManager | null = null;

export function getUserImagesManager(): UserImagesManager {
  if (!userImagesManager) {
    userImagesManager = new UserImagesManager();
  }
  return userImagesManager;
}

export function registerUserImagesScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'lynxlocal',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        stream: true,
      },
    },
  ]);
}
