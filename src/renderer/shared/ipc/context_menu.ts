import contextMenuChannels from '@lynx_cross/consts/ipc_channels/context_menu';
import {ContextResizeData} from '@lynx_cross/types';
import {ContextMenuVolumeData} from '@lynx_cross/types/ipc';
import type {ContextMenuParams} from 'electron';

import {NavHistory} from '../../child_windows/context_menu/types';
import lynxIpc from './lynxIpc';

const contextMenuIpc = {
  send: {
    // Resizes context menu window
    resizeWindow: (data: ContextResizeData) => lynxIpc.send(contextMenuChannels.resizeWindow, data),

    // Shows context menu window
    showWindow: () => lynxIpc.send(contextMenuChannels.showWindow),

    // Hides context menu window
    hideWindow: () => lynxIpc.send(contextMenuChannels.hideWindow),

    // Opens terminate AI dialog
    openTerminateProcess: (id: string) => lynxIpc.send(contextMenuChannels.openTerminateAI, id),

    // Opens terminate tab dialog
    openTerminateTab: (id: string, customPosition?: {x: number; y: number}) =>
      lynxIpc.send(contextMenuChannels.openTerminateTab, id, customPosition),

    // Opens close app dialog
    openCloseApp: () => lynxIpc.send(contextMenuChannels.openCloseApp),

    // Relaunches AI process
    relaunchAI: (id: string) => lynxIpc.send(contextMenuChannels.relaunchAI, id),

    // Stops AI process
    stopAI: (id: string) => lynxIpc.send(contextMenuChannels.stopAI, id),

    // Removes browser tab
    removeTab: (tabID: string) => lynxIpc.send(contextMenuChannels.removeTab, tabID),
  },

  on: {
    // Listens for context menu view initialization events
    initView: (callback: (params: ContextMenuParams, navHistory: NavHistory, id: number) => void) =>
      lynxIpc.on(contextMenuChannels.onInitView, callback),

    // Listens for find in page events
    find: (callback: (id: string) => void) => lynxIpc.on(contextMenuChannels.onFind, callback),

    // Listens for terminate AI events
    terminateProcess: (callback: (id: string) => void) => lynxIpc.on(contextMenuChannels.onTerminateAI, callback),

    // Listens for terminate tab events
    terminateTab: (callback: (id: string) => void) => lynxIpc.on(contextMenuChannels.onTerminateTab, callback),

    // Listens for close app events
    closeApp: (callback: () => void) => lynxIpc.on(contextMenuChannels.onCloseApp, callback),

    // Listens for zoom events
    zoom: (callback: (id: string, zoomFactor: number) => void) => lynxIpc.on(contextMenuChannels.onZoom, callback),

    prompt: (callback: (message: string, defaultValue?: string) => void) =>
      lynxIpc.on(contextMenuChannels.onPrompt, callback),

    // Listens for zoom events
    downloads: (callback: () => void) => lynxIpc.on(contextMenuChannels.onDownloads, callback),

    // Listens for volume control events
    volume: (callback: (data: ContextMenuVolumeData) => void) => lynxIpc.on(contextMenuChannels.onVolume, callback),

    // Listens for AI relaunch events
    relaunchProcess: (callback: (id: string) => void) => lynxIpc.on(contextMenuChannels.onRelaunchAI, callback),

    // Listens for AI stop events
    stopProcess: (callback: (id: string) => void) => lynxIpc.on(contextMenuChannels.onStopAI, callback),

    // Listens for tab removal events
    removeTab: (callback: (tabID: string) => void) => lynxIpc.on(contextMenuChannels.onRemoveTab, callback),
  },
};

export default contextMenuIpc;
