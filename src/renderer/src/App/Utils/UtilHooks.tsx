import {addToast, Button} from '@heroui/react';
import {Dispatch} from '@reduxjs/toolkit';
import {isEmpty, isNil} from 'lodash';
import {Fragment, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {ChangelogItem} from '../../../../cross/CrossTypes';
import {InstalledCard} from '../../../../cross/StorageTypes';
import {appActions} from '../Redux/Reducer/AppReducer';
import {cardsActions, useCardsState} from '../Redux/Reducer/CardsReducer';
import {useSettingsState} from '../Redux/Reducer/SettingsReducer';
import {tabsActions, useTabsState} from '../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../Redux/Store';
import rendererIpc from '../RendererIpc';
import {HeroToastPlacement} from './Types';

/**
 * Hook to get an installed card by its ID.
 * @param cardId - The ID of the card to find
 * @returns The installed card or undefined if not found
 */
export function useInstalledCard(cardId: string): InstalledCard | undefined {
  const installedCards = useCardsState('installedCards');
  return useMemo(() => installedCards.find(card => card.id === cardId), [installedCards, cardId]);
}

/**
 * Hook to get an updating card by its ID.
 * @param cardId - The ID of the card to find
 * @returns The updating card or undefined if not found
 */
export function useUpdatingCard(cardId: string): boolean {
  const updatingCards = useCardsState('updatingCards');
  return useMemo(() => updatingCards.some(card => card.id === cardId), [updatingCards, cardId]);
}

/**
 * Hook to check if an update is available for a card.
 * @param cardId - The ID of the card to check
 * @returns Boolean indicating if an update is available
 */
export function useUpdateAvailable(cardId: string): boolean {
  const updateAvailable = useCardsState('updateAvailable');
  return useMemo(() => updateAvailable.includes(cardId), [updateAvailable, cardId]);
}

/**
 * Hook to check if a card is set for auto-update.
 * @param cardId - The ID of the card to check
 * @returns Boolean indicating if the card is set for auto-update
 */
export function useIsAutoUpdateCard(cardId: string): boolean {
  const autoUpdate = useCardsState('autoUpdate');
  return useMemo(() => autoUpdate.includes(cardId), [autoUpdate, cardId]);
}

export function useIsAutoUpdateExtensions(cardId: string): boolean {
  const autoUpdate = useCardsState('autoUpdateExtensions');
  return useMemo(() => autoUpdate.includes(cardId), [autoUpdate, cardId]);
}

export function useStopAI() {
  const runningCards = useCardsState('runningCard');
  const activeTab = useTabsState('activeTab');

  const dispatch = useDispatch<AppDispatch>();

  return useCallback(
    (id: string) => {
      const runningCard = runningCards.find(card => card.id === id);
      if (!runningCard) return;

      if (runningCard.isEmptyRunning) {
        rendererIpc.pty.emptyProcess(runningCard.id, 'stop');
      } else {
        rendererIpc.pty.stop(runningCard.id);
      }

      dispatch(tabsActions.setActiveTabLoading(false));
      dispatch(tabsActions.setTabIsTerminal({tabID: activeTab, isTerminal: false}));
      dispatch(cardsActions.stopRunningCard({tabId: activeTab}));
      rendererIpc.win.setDiscordRpAiRunning({running: false});
    },
    [runningCards, activeTab, dispatch],
  );
}

/**
 * Hook to check if a card is pinned.
 * @param cardId - The ID of the card to check
 * @returns Boolean indicating if the card is pinned
 */
export function useIsPinnedCard(cardId: string): boolean {
  const pinnedCards = useCardsState('pinnedCards');
  return useMemo(() => pinnedCards.includes(cardId), [pinnedCards, cardId]);
}

function topToast(options: {
  title: string;
  color?: 'success' | 'default' | 'foreground' | 'primary' | 'secondary' | 'warning' | 'danger' | undefined;
  timeout?: number;
  promise?: Promise<any>;
  placement: HeroToastPlacement;
}) {
  const {title, color = 'success', timeout = 2000, promise, placement} = options;

  addToast({
    title,
    color,
    variant: 'flat',
    size: 'sm',
    timeout,
    promise,
    classNames: {
      base: placement.includes('top')
        ? 'top-10'
        : `right-6 bottom-8 flex flex-col gap-y-2 cursor-default ${color === 'danger' && 'pt-6'}`,
    },
    endContent:
      placement.includes('bottom') && color === 'danger' ? (
        <div className="w-full flex flex-row justify-end">
          <Button size={'sm'} color={'warning'} variant={'light'}>
            Restart App
          </Button>
        </div>
      ) : null,
  });
}

export const lynxTopToast = (dispatch: Dispatch, placement: HeroToastPlacement = 'top-center') => {
  dispatch(appActions.setToastPlacement(placement));
  return {
    success: (title: string, timeout?: number) => topToast({title, color: 'success', timeout, placement}),
    error: (title: string, timeout?: number) => topToast({title, color: 'danger', timeout, placement}),
    warning: (title: string, timeout?: number) => topToast({title, color: 'warning', timeout, placement}),
    info: (title: string, timeout?: number) => topToast({title, color: 'default', timeout, placement}),
    loading: (title: string, promise: Promise<any>) =>
      topToast({title, color: 'default', promise, timeout: 1, placement}),
  };
};

export const useDisableTooltip = (isEssential: boolean = false): boolean => {
  const tooltipLevel = useSettingsState('tooltipLevel');

  // Disable All
  if (tooltipLevel === 'none') return true;

  // Show All
  if (tooltipLevel === 'full') return false;

  // Show if tooltip set to essential
  return !isEssential;
};

export function RenderSubItems(items?: ChangelogItem[], parentKey: string = '') {
  if (isNil(items) || isEmpty(items)) return null;

  return (
    <ul style={{listStyleType: 'disc', paddingLeft: '20px'}}>
      {items.map((item, index) => {
        const currentKey = `${parentKey}_${index}`;
        return (
          <Fragment key={currentKey}>
            <li>{item.label}</li>
            {item.subitems && RenderSubItems(item.subitems, currentKey)}
          </Fragment>
        );
      })}
    </ul>
  );
}

export const isLinuxPortable = window.isPortable === 'linux';

export function useCachedImage(id: string, url: string, refresh: boolean = true) {
  const [cachedImage, setCachedImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!url) return;

    const setRawUrl = () => {
      setCachedImage(url);
    };

    const cachedImg = localStorage.getItem(`${id}_${url}`);

    if (cachedImg) {
      setCachedImage(cachedImg);
    }

    if (refresh || !cachedImg) {
      rendererIpc.utils.isResponseValid(url).then(isValid => {
        if (isValid) {
          rendererIpc.utils
            .getImageAsDataURL(url)
            .then(result => {
              if (result) {
                if (result !== cachedImg) {
                  localStorage.setItem(`${id}_${url}`, result);
                  setCachedImage(result);
                }
              } else {
                setRawUrl();
              }
            })
            .catch(() => {
              setRawUrl();
            });
        } else {
          setCachedImage(undefined);
        }
      });
    }
  }, [id, url, refresh]);

  return cachedImage;
}
