import {useTabModalClose, useTabModalOpen, useTabVisibility} from '../../layouts/tabs/utils';
import {TabModalKey, tabModalRegistry} from './tabModalRegistry';

export function useTabModalManager() {
  // Create fixed openers per modal key to avoid using hooks in a loop
  const readme = useTabModalOpen(tabModalRegistry.readme.open as any);
  const cardInfo = useTabModalOpen(tabModalRegistry.cardInfo.open as any);
  const installUI = useTabModalOpen(tabModalRegistry.installUI.open as any);
  const cardLaunchConfig = useTabModalOpen(tabModalRegistry.cardLaunchConfig.open as any);
  const cardExtensions = useTabModalOpen(tabModalRegistry.cardExtensions.open as any);
  const cardUninstall = useTabModalOpen(tabModalRegistry.cardUninstall.open as any);
  const cardUnassign = useTabModalOpen(tabModalRegistry.cardUnassign.open as any);
  const gitManager = useTabModalOpen(tabModalRegistry.gitManager.open as any);

  const map: Record<TabModalKey, {openInActiveTab: (p: any) => void; openInNewTab: (p: any) => void}> = {
    readme,
    cardInfo,
    installUI,
    cardLaunchConfig,
    cardExtensions,
    cardUninstall,
    cardUnassign,
    gitManager,
  } as const;

  function openModal<K extends TabModalKey>(
    key: K,
    payload: Omit<Parameters<(typeof tabModalRegistry)[K]['open']>[0], 'tabID'>,
    scope: 'active' | 'new' = 'active',
  ) {
    const {openInActiveTab, openInNewTab} = map[key];
    const fn = scope === 'active' ? openInActiveTab : openInNewTab;
    fn(payload as any);
  }

  return {openModal};
}

export function useTabModalLifecycle(key: TabModalKey, tabID: string) {
  const {close, remove} = tabModalRegistry[key];
  const {onOpenChange} = useTabModalClose(close as any, remove as any);
  const show = useTabVisibility(tabID);

  return {onOpenChange, show};
}
