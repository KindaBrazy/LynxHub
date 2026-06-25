import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {useEffect, useState} from 'react';

/**
 * Hook to track which section is currently active in the viewport.
 *
 * @param itemIds - List of element IDs to track.
 * @param threshold - Intersection observer threshold.
 * @returns The ID of the currently active section.
 */
export const useScrollSpy = (itemIds: string[], threshold = 0.1): string => {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (activeId) {
      AddBreadcrumb_Renderer(`Dashboard Section Visited: ${activeId}`);
    }
  }, [activeId]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    let timeoutId: NodeJS.Timeout;

    const setupObservers = () => {
      if (itemIds.length === 0) return;

      // Find the scroll container (heuristic: first element's parent chain)
      const firstElem = document.getElementById(itemIds[0]);
      if (!firstElem) {
        // Retry if elements are not yet mounted
        timeoutId = setTimeout(setupObservers, 100);
        return;
      }

      // Find the OverlayScrollbars viewport or fallback to window/parent
      let scrollContainer: Element | null = firstElem;
      while (scrollContainer && !scrollContainer.classList.contains('os-viewport')) {
        scrollContainer = scrollContainer.parentElement;
        if (!scrollContainer) break; // Safety break
      }

      // Track intersection ratios for ALL sections
      const intersectionRatios = new Map<string, number>();

      itemIds.forEach(itemId => {
        const elem = document.getElementById(itemId);
        if (elem) {
          const observer = new IntersectionObserver(
            ([entry]) => {
              intersectionRatios.set(itemId, entry.intersectionRatio);

              // Find the section with the highest intersection ratio
              let maxRatio = 0;
              let topSection = '';
              intersectionRatios.forEach((ratio, id) => {
                if (ratio > maxRatio) {
                  maxRatio = ratio;
                  topSection = id;
                }
              });

              if (maxRatio > threshold) {
                setActiveId(topSection);
              }
            },
            {
              root: scrollContainer,
              threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
            },
          );
          observer.observe(elem);
          observers.push(observer);
        }
      });
    };

    timeoutId = setTimeout(setupObservers, 100);

    return () => {
      clearTimeout(timeoutId);
      observers.forEach(observer => observer.disconnect());
    };
  }, [itemIds, threshold]);

  return activeId;
};
