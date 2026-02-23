import {useEffect, useSyncExternalStore} from 'react';

const sectionTexts = new Map<string, string>();
const listeners = new Set<() => void>();
let registryVersion = 0;

/** Emits a change event to all listeners when the registry updates */
const emitChange = () => {
  registryVersion += 1;
  listeners.forEach(listener => listener());
};

/** Normalizes text by collapsing multiple whitespace characters into single spaces */
const normalizeTextContent = (text: string) => text.replace(/\s+/g, ' ').trim();

/**
 * Sets or updates the searchable text content for a given settings section.
 * @param id The unique ID of the settings section
 * @param text The text content to store
 */
export const setSectionSearchText = (id: string, text: string) => {
  if (!id) return;
  const normalized = normalizeTextContent(text);
  const current = sectionTexts.get(id);
  if (current === normalized) return;
  sectionTexts.set(id, normalized);
  emitChange();
};

/**
 * Removes a settings section from the searchable registry.
 * @param id The unique ID of the settings section
 */
export const removeSectionSearchText = (id: string) => {
  if (!id) return;
  if (!sectionTexts.has(id)) return;
  sectionTexts.delete(id);
  emitChange();
};

/**
 * Retrieves the currently registered search text for a section.
 * @param id The unique ID of the settings section
 */
export const getSectionSearchText = (id: string | undefined) => {
  if (!id) return undefined;
  return sectionTexts.get(id);
};

/**
 * Subscribes a listener function to be called whenever the registry changes.
 * @param listener Callback function invoked on change
 * @returns An unsubscribe function
 */
export const subscribeSectionSearchRegistry = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

let cachedMap = new Map<string, string>();
let lastVersion = -1;

/** Retrieves an immutable snapshot of the section search registry */
const getRegistrySnapshot = () => {
  if (lastVersion !== registryVersion) {
    cachedMap = new Map(sectionTexts);
    lastVersion = registryVersion;
  }
  return cachedMap;
};

/**
 * React hook to get a reactive snapshot of the entire search registry.
 * @returns A Map containing section IDs and their searchable texts
 */
export const useSectionSearchSnapshot = () => {
  return useSyncExternalStore(subscribeSectionSearchRegistry, getRegistrySnapshot);
};

/** Helper to join arrays of strings or return strings as-is */
const toStaticText = (staticText?: string | string[]) => {
  if (!staticText) return '';
  return Array.isArray(staticText) ? staticText.join(' ') : staticText;
};

/**
 * Hook that auto-registers a specific section ID to the search registry.
 * It uses a MutationObserver to actively collect any textual content inside the rendered section
 * and updates its registry entry proactively.
 * @param sectionId The target section element ID
 * @param staticText Additional static strings to be merged with dynamic text content
 */
export const useRegisterSectionSearch = (sectionId?: string, staticText?: string | string[]) => {
  const staticTextValue = toStaticText(staticText);

  useEffect(() => {
    if (!sectionId) return;

    let observer: MutationObserver | null = null;
    let frameId: number | null = null;
    let activeElement: HTMLElement | null = null;

    const update = () => {
      const contentText = activeElement?.textContent ?? '';
      setSectionSearchText(sectionId, `${contentText} ${staticTextValue}`.trim());
    };

    const connect = () => {
      const element = document.getElementById(sectionId);
      if (!element) {
        frameId = window.requestAnimationFrame(connect);
        return;
      }

      activeElement = element;
      update();

      observer = new MutationObserver(update);
      observer.observe(element, {childList: true, subtree: true, characterData: true});
    };

    connect();

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      observer?.disconnect();
      removeSectionSearchText(sectionId);
    };
  }, [sectionId, staticTextValue]);
};
