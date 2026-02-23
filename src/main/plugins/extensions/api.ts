import {mainIpcEventsApi} from '@lynx_main/ipc/ipcEvents';

import {initPluginNodeSentry} from '../sentry';
import {ElectronMenuItem, ExtensionCallbacks, ExtensionMainApi} from './types';

/**
 * Implementation of the Extension Main API.
 * Manages callbacks registered by extensions and exposes methods to invoke them.
 */
export default class ExtensionApi {
  private readonly callbacks: ExtensionCallbacks;
  private readonly publicApi: ExtensionMainApi;

  constructor() {
    this.callbacks = {
      listenForChannels: [],
      onAppReady: [],
      onReadyToShow: [],
      trayMenu_AddItem: [],
    };

    this.publicApi = {
      listenForChannels: callback => this.callbacks.listenForChannels.push(callback),
      onAppReady: callback => this.callbacks.onAppReady.push(callback),
      onReadyToShow: callback => this.callbacks.onReadyToShow.push(callback),
      trayMenu_AddItem: callback => this.callbacks.trayMenu_AddItem.push(callback),
      ipcEvents: mainIpcEventsApi,
      initNodeSentry: initPluginNodeSentry,
    };
  }

  /**
   * Returns the public API object to be passed to extensions.
   * @returns The ExtensionMainApi object.
   */
  public getApi(): ExtensionMainApi {
    return this.publicApi;
  }

  /**
   * Invokes all registered 'listenForChannels' callbacks.
   */
  public listenForChannels(): void {
    for (const listenForChannels of this.callbacks.listenForChannels) {
      listenForChannels();
    }
  }

  /**
   * Invokes all registered 'onAppReady' callbacks sequentially.
   */
  public async onAppReady(): Promise<void> {
    for (const onAppReady of this.callbacks.onAppReady) {
      await onAppReady();
    }
  }

  /**
   * Invokes all registered 'onReadyToShow' callbacks.
   */
  public onReadyToShow(): void {
    for (const onReadyToShow of this.callbacks.onReadyToShow) {
      onReadyToShow();
    }
  }

  /**
   * Retrieves tray items from registered extensions.
   * @param staticItems - The existing tray items.
   * @returns The updated list of tray items.
   */
  public getTrayItems(staticItems: ElectronMenuItem[]): ElectronMenuItem[] {
    for (const addTrayItem of this.callbacks.trayMenu_AddItem) {
      const {item, index} = addTrayItem();
      // Ensure index is within bounds, default to end if invalid?
      // Splice allows index > length (appends) and negative (from end).
      // We assume extensions provide valid logic, but we could add safety checks.
      staticItems.splice(index, 0, item);
    }
    return staticItems;
  }
}
