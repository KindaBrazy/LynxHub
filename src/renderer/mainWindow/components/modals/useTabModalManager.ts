import {ActionCreatorWithPayload} from '@reduxjs/toolkit';
import {useCallback} from 'react';

import {useTabModalClose, useTabModalOpen, useTabVisibility} from '../../layouts/tabs/utils';
import {TabModalKey, tabModalRegistry} from './tabModalRegistry';

/**
 * Hook to manage opening tab-based modals.
 * Provides a unified `openModal` function that can open modals in the active tab or a new tab.
 */
export function useTabModalManager() {
  // Create fixed openers per modal key to avoid using hooks in a loop
  // We cast to any here because TypeScript struggles to infer the exact payload type for each action creator
  // when passed to the generic hook in this specific pattern, but the runtime behavior is correct.
  // Using specific casts or a mapped type would be more verbose but safer.
  const readme = useTabModalOpen(tabModalRegistry.readme.open as unknown as ActionCreatorWithPayload<any>);
  const cardInfo = useTabModalOpen(tabModalRegistry.cardInfo.open as unknown as ActionCreatorWithPayload<any>);
  const installUI = useTabModalOpen(tabModalRegistry.installUI.open as unknown as ActionCreatorWithPayload<any>);
  const cardLaunchConfig = useTabModalOpen(
    tabModalRegistry.cardLaunchConfig.open as unknown as ActionCreatorWithPayload<any>,
  );
  const cardExtensions = useTabModalOpen(
    tabModalRegistry.cardExtensions.open as unknown as ActionCreatorWithPayload<any>,
  );
  const cardUninstall = useTabModalOpen(
    tabModalRegistry.cardUninstall.open as unknown as ActionCreatorWithPayload<any>,
  );
  const cardUnassign = useTabModalOpen(tabModalRegistry.cardUnassign.open as unknown as ActionCreatorWithPayload<any>);
  const gitManager = useTabModalOpen(tabModalRegistry.gitManager.open as unknown as ActionCreatorWithPayload<any>);

  const map: Record<TabModalKey, {openInActiveTab: (p: any) => void; openInNewTab: (p: any) => void}> = {
    readme,
    cardInfo,
    installUI,
    cardLaunchConfig,
    cardExtensions,
    cardUninstall,
    cardUnassign,
    gitManager,
  };

  /**
   * Opens a modal by its key.
   * @param key The key of the modal to open (defined in tabModalRegistry).
   * @param payload The payload for the modal open action (excluding tabID).
   * @param scope Whether to open in the 'active' tab or a 'new' tab. Defaults to 'active'.
   */
  const openModal = useCallback(
    <K extends TabModalKey>(
      key: K,
      payload: Omit<Parameters<(typeof tabModalRegistry)[K]['open']>[0], 'tabID'>,
      scope: 'active' | 'new' = 'active',
    ) => {
      const {openInActiveTab, openInNewTab} = map[key];
      const fn = scope === 'active' ? openInActiveTab : openInNewTab;
      fn(payload);
    },
    [readme, cardInfo, installUI, cardLaunchConfig, cardExtensions, cardUninstall, cardUnassign, gitManager],
  );

  return {openModal};
}

/**
 * Hook to manage the lifecycle (close/remove) of a tab-based modal.
 * @param key The key of the modal.
 * @param tabID The ID of the tab the modal belongs to.
 */
export function useTabModalLifecycle(key: TabModalKey, tabID: string) {
  const {close, remove} = tabModalRegistry[key];
  const {onOpenChange} = useTabModalClose(
    close as unknown as ActionCreatorWithPayload<{tabID: string}>,
    remove as unknown as ActionCreatorWithPayload<{tabID: string}>,
  );
  const show = useTabVisibility(tabID);

  return {onOpenChange, show};
}
