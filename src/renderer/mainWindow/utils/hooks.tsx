import {addToast, Button} from '@heroui/react';
import {useCardsState} from '@lynx/redux/reducers/cards';
import {useSettingsState} from '@lynx/redux/reducers/settings';
import {ChangelogItem, type ElementResizeData, HeroToastPlacement} from '@lynx_common/types';
import {InstalledCard} from '@lynx_common/types/storage';
import {isEmpty, isNil} from 'lodash';
import {Fragment, useEffect, useRef, useState} from 'react';

/**
 * Hook to get an installed card by its ID.
 * @param cardId - The ID of the card to find
 * @returns The installed card or undefined if not found
 */
export function useInstalledCard(cardId: string): InstalledCard | undefined {
  const installedCards = useCardsState('installedCards');
  return installedCards.find(card => card.id === cardId);
}

/**
 * Hook to get an updating card by its ID.
 * @param cardId - The ID of the card to find
 * @returns The updating card or undefined if not found
 */
export function useUpdatingCard(cardId: string): boolean {
  const updatingCards = useCardsState('updatingCards');
  return updatingCards.some(card => card.id === cardId);
}

/**
 * Hook to check if an update is available for a card.
 * @param cardId - The ID of the card to check
 * @returns Boolean indicating if an update is available
 */
export function useUpdateAvailable(cardId: string): boolean {
  const updateAvailable = useCardsState('updateAvailable');
  return updateAvailable.includes(cardId);
}

/**
 * Hook to check if a card is set for auto-update.
 * @param cardId - The ID of the card to check
 * @returns Boolean indicating if the card is set for auto-update
 */
export function useIsAutoUpdateCard(cardId: string): boolean {
  const autoUpdate = useCardsState('autoUpdate');
  return autoUpdate.includes(cardId);
}

/**
 * Hook to check if a card's extensions are set for auto-update.
 * @param cardId - The ID of the card to check
 * @returns Boolean indicating if the card's extensions are set for auto-update
 */
export function useIsAutoUpdateExtensions(cardId: string): boolean {
  const autoUpdate = useCardsState('autoUpdateExtensions');
  return autoUpdate.includes(cardId);
}

/**
 * Hook to check if a card is pinned.
 * @param cardId - The ID of the card to check
 * @returns Boolean indicating if the card is pinned
 */
export function useIsPinnedCard(cardId: string): boolean {
  const pinnedCards = useCardsState('pinnedCards');
  return pinnedCards.includes(cardId);
}

/**
 * Hook to determine if tooltips should be disabled based on settings.
 * @param isEssential - Whether the tooltip is essential (always shown in 'essential' mode)
 * @returns Boolean indicating if the tooltip should be disabled
 */
export function useDisableTooltip(isEssential: boolean = false): boolean {
  const tooltipLevel = useSettingsState('tooltipLevel');

  // Disable All
  if (tooltipLevel === 'none') return true;

  // Show All
  if (tooltipLevel === 'full') return false;

  // Show if tooltip set to essential
  return !isEssential;
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
        ? 'top-6'
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

/**
 * Creates a toast notification helper with various severity levels.
 * @param dispatch - Redux dispatch function
 * @param placement - Toast placement on screen
 * @returns Object with toast methods (success, error, warning, info, loading)
 */
export const lynxTopToast = (_d, placement?) => {
  return {
    success: (title: string, timeout?: number) => topToast({title, color: 'success', timeout, placement}),
    error: (title: string, timeout?: number) => topToast({title, color: 'danger', timeout, placement}),
    warning: (title: string, timeout?: number) => topToast({title, color: 'warning', timeout, placement}),
    info: (title: string, timeout?: number) => topToast({title, color: 'default', timeout, placement}),
    loading: (title: string, promise: Promise<any>) =>
      topToast({title, color: 'default', promise, timeout: 1, placement}),
  };
};

/**
 * Recursively renders changelog items as a nested list.
 * @param items - Array of changelog items
 * @param parentKey - Parent key for React keys
 * @returns JSX element or null
 */
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

/**
 * Checks if the app is running as a Linux portable version.
 */
export const isLinuxPortable = window.isPortable === 'linux';

export function useElementResizing(onResize: (data: ElementResizeData) => void) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const sendSize = () => {
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const width = Math.max(Math.ceil(element.scrollWidth), Math.ceil(rect.width));
      const height = Math.max(Math.ceil(element.scrollHeight), Math.ceil(rect.height));

      const dpr = window.devicePixelRatio || 1;
      onResize({width, height, dpr, x: rect.x, y: rect.y});
    };

    const resizeObserver = new ResizeObserver(() => {
      sendSize();
    });

    resizeObserver.observe(element);
    sendSize(); // Initial size send

    return () => resizeObserver.disconnect();
  }, []);

  return containerRef;
}

export function useHasScroll() {
  const [hasScroll, setHasScroll] = useState<boolean>(false);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef) setHasScroll(containerRef.scrollWidth > containerRef.clientWidth);
  }, [containerRef]);

  return {hasScroll, containerRef, setContainerRef};
}
