import {Dispatch, ReactNode, RefObject, SetStateAction, useEffect} from 'react';

import rendererIpc from '../../src/App/RendererIpc';
import {useFindMenu, useZoomMenu} from './OtherMenu';
import useRightClickMenu from './RightClickMenu';
import {useCloseAppMenu, useTerminateAIMenu, useTerminateTabMenu} from './TerminateMenu';

export function useResize(divRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        const {width, height} = entries[0].contentRect;
        rendererIpc.contextMenu.resizeWindow({width, height});
      }
    });

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    return () => {
      observer.disconnect();
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
