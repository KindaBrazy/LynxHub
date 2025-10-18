import {Dispatch, ReactNode, RefObject, SetStateAction, useLayoutEffect, useRef} from 'react';

import rendererIpc from '../../src/App/RendererIpc';
import {useFindMenu, useZoomMenu} from './OtherMenu';
import useRightClickMenu from './RightClickMenu';
import {useCloseAppMenu, useTerminateAIMenu, useTerminateTabMenu} from './TerminateMenu';

type DimensionsMsg = {width: number; height: number; dpr: number};

export function useResize(divRef: RefObject<HTMLDivElement | null>) {
  const rafRef = useRef<number | null>(null);
  const lastSent = useRef<{w: number; h: number} | null>(null);

  useLayoutEffect(() => {
    const el = divRef.current;
    if (!el) return;

    const sendSize = () => {
      const width = Math.max(Math.ceil(el.scrollWidth), Math.ceil(el.getBoundingClientRect().width));
      const height = Math.max(Math.ceil(el.scrollHeight), Math.ceil(el.getBoundingClientRect().height));

      const PADDING = 2;
      const w = Math.max(1, Math.round(width + PADDING));
      const h = Math.max(1, Math.round(height + PADDING));

      if (lastSent.current && lastSent.current.w === w && lastSent.current.h === h) {
        return;
      }
      lastSent.current = {w, h};

      const dpr = window.devicePixelRatio || 1;
      const msg: DimensionsMsg = {width: w, height: h, dpr};
      rendererIpc.contextMenu.resizeWindow(msg);
    };

    const ro = new ResizeObserver(() => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        sendSize();
      });
    });

    ro.observe(el);

    sendSize();

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [divRef]);
}

export type SetElementsType = Dispatch<SetStateAction<ReactNode[]>>;
export type SetWidthSizeType = Dispatch<SetStateAction<'sm' | 'md' | 'lg'>>;

export function useContextMenuSetup(setElements: SetElementsType, setWidthSize: SetWidthSizeType) {
  useRightClickMenu(setElements, setWidthSize);
  useZoomMenu(setElements, setWidthSize);
  useFindMenu(setElements, setWidthSize);

  useTerminateAIMenu(setElements, setWidthSize);
  useTerminateTabMenu(setElements, setWidthSize);
  useCloseAppMenu(setElements, setWidthSize);
}
