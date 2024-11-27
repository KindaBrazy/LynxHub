import {GitProgressCallback, initializerChannels} from '../../cross/IpcChannelAndTypes';

const initializerIpc = {
  minimize: (): void => window.electron.ipcRenderer.send(initializerChannels.minimize),

  close: (): void => window.electron.ipcRenderer.send(initializerChannels.close),

  gitAvailable: (): Promise<string> => window.electron.ipcRenderer.invoke(initializerChannels.gitAvailable),

  installAIModule: (): void => window.electron.ipcRenderer.send(initializerChannels.installAIModule),

  onInstallAIModule: (callback: GitProgressCallback) =>
    window.electron.ipcRenderer.on(initializerChannels.onInstallAIModule, callback),

  startApp: (): void => window.electron.ipcRenderer.send(initializerChannels.startApp),
};
export default initializerIpc;
