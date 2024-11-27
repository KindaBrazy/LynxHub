import {EMenuItem, ExtensionData_Main, ExtensionMainApi} from './ExtensionTypes_Main';

export default class ExtensionApi {
  private readonly extensionsData: ExtensionData_Main;
  private readonly extensionMainApi: ExtensionMainApi;

  constructor() {
    this.extensionsData = {
      listenForChannels: [],
      onAppReady: [],
      onReadyToShow: [],
      trayMenu_AddItem: [],
    };

    this.extensionMainApi = {
      listenForChannels: fc => this.extensionsData.listenForChannels.push(fc),
      onAppReady: fc => this.extensionsData.onAppReady.push(fc),
      onReadyToShow: fc => this.extensionsData.onReadyToShow.push(fc),
      trayMenu_AddItem: fc => this.extensionsData.trayMenu_AddItem.push(fc),
    };
  }

  public getApi() {
    return this.extensionMainApi;
  }

  public listenForChannels() {
    for (const listenForChannels of this.extensionsData.listenForChannels) {
      listenForChannels();
    }
  }

  public async onAppReady() {
    for (const onAppReady of this.extensionsData.onAppReady) {
      await onAppReady();
    }
  }

  public onReadyToShow() {
    for (const onReadyToShow of this.extensionsData.onReadyToShow) {
      onReadyToShow();
    }
  }

  public getTrayItems(staticItems: EMenuItem[]) {
    for (const addTrayItem of this.extensionsData.trayMenu_AddItem) {
      const item = addTrayItem();
      staticItems.splice(item.index, 0, item.item);
    }
    return staticItems;
  }
}
