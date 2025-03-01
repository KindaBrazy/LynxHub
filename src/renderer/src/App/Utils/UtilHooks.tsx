import {isEmpty, isNil} from 'lodash';
import {Fragment, useMemo, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import {ChangelogItem} from '../../../../cross/CrossTypes';
import {InstalledCard} from '../../../../cross/StorageTypes';
import {useCardsState} from '../Redux/Reducer/CardsReducer';
import {useSettingsState} from '../Redux/Reducer/SettingsReducer';
import {UpdatingCard} from './Types';

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
export function useUpdatingCard(cardId: string): UpdatingCard | undefined {
  const updatingCards = useCardsState('updatingCards');
  return useMemo(() => updatingCards.find(card => card.id === cardId), [updatingCards, cardId]);
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

/**
 * Hook to check if a card is pinned.
 * @param cardId - The ID of the card to check
 * @returns Boolean indicating if the card is pinned
 */
export function useIsPinnedCard(cardId: string): boolean {
  const pinnedCards = useCardsState('pinnedCards');
  return useMemo(() => pinnedCards.includes(cardId), [pinnedCards, cardId]);
}

export const useDisableTooltip = (isEssential: boolean = false): boolean => {
  const tooltipLevel = useSettingsState('tooltipLevel');

  // Disable All
  if (tooltipLevel === 'none') return true;

  // Show All
  if (tooltipLevel === 'full') return false;

  // Show if tooltip set to essential
  return !isEssential;
};

export const useCtrlPressed = () => {
  const [isCtrlPressed, setIsCtrlPressed] = useState<boolean>(false);

  useHotkeys(
    'ctrl',
    () => {
      setIsCtrlPressed(true);
    },
    {
      keydown: true,
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );
  useHotkeys(
    'ctrl',
    () => {
      setIsCtrlPressed(false);
    },
    {
      keyup: true,
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  return {isCtrlPressed, setIsCtrlPressed};
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
