import {useEffect, useMemo, useState} from 'react';

const sectionTexts = new Map<string, string>();
const listeners = new Set<() => void>();
let registryVersion = 0;

const emitChange = () => {
  registryVersion += 1;
  listeners.forEach(listener => listener());
};

const normalizeTextContent = (text: string) => text.replace(/\s+/g, ' ').trim();

export const setSectionSearchText = (id: string, text: string) => {
  if (!id) return;
  const normalized = normalizeTextContent(text);
  const current = sectionTexts.get(id);
  if (current === normalized) return;
  sectionTexts.set(id, normalized);
  emitChange();
};

export const removeSectionSearchText = (id: string) => {
  if (!id) return;
  if (!sectionTexts.has(id)) return;
  sectionTexts.delete(id);
  emitChange();
};

export const getSectionSearchText = (id: string | undefined) => {
  if (!id) return undefined;
  return sectionTexts.get(id);
};

export const subscribeSectionSearchRegistry = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useSectionSearchSnapshot = () => {
  const [version, setVersion] = useState(registryVersion);

  useEffect(() => {
    const unsubscribe = subscribeSectionSearchRegistry(() => setVersion(registryVersion));
    return () => {
      unsubscribe();
    };
  }, []);

  return useMemo(() => new Map(sectionTexts), [version]);
};

const toStaticText = (staticText?: string | string[]) => {
  if (!staticText) return '';
  return Array.isArray(staticText) ? staticText.join(' ') : staticText;
};

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
