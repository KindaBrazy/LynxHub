import {app, BrowserWindow} from 'electron';

import ExtensionManager from './Extensions/ExtensionManager';
import ModuleManager from './Modules/ModuleManager';

export async function PluginMigrate(storageManager) {
  if (!storageManager.getData('plugin').migrated) {
    const migrationWindow = new BrowserWindow({
      width: 450,
      height: 200,
      resizable: false,
      frame: false,
      show: false,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #212121;
            color: #f0f0f0;
            text-align: center;
            overflow: hidden;
            border-radius: 8px;
          }
          .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1.5s linear infinite;
            margin-bottom: 20px;
          }
          h2 { margin: 0; }
          #status { 
            color: #aaa;
            margin-top: 8px;
            min-height: 20px;
          }
        </style>
      </head>
      <body>
        <div class="loader"></div>
        <h2>Applying Updates</h2>
        <p id="status">Initializing migration...</p>
      </body>
      </html>
    `;

    await migrationWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(htmlContent)}`);

    migrationWindow.on('ready-to-show', () => {
      migrationWindow.show();
    });

    const updateStatus = async (message: string) => {
      const script = `document.getElementById('status').innerText = ${JSON.stringify(message)};`;
      if (migrationWindow && !migrationWindow.isDestroyed()) {
        await migrationWindow.webContents.executeJavaScript(script);
      }
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      await updateStatus('Migrating extensions...');
      await new ExtensionManager().migrate();

      await updateStatus('Migrating modules...');
      await new ModuleManager().migrate();

      storageManager.updateData('plugin', {migrated: true});

      await updateStatus('Done! Restarting the application...');

      await new Promise(resolve => setTimeout(resolve, 2000));

      app.relaunch({execPath: process.env.PORTABLE_EXECUTABLE_FILE || process.env.APPIMAGE});
      app.quit();
    } catch (error) {
      console.error('Migration failed:', error);

      await updateStatus(`Error: Migration failed. Please restart the app. Details: ${error.message}`);
    }
  }
}
