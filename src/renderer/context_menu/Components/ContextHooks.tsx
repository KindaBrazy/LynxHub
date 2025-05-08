import {Dispatch, ReactNode, RefObject, SetStateAction, useEffect} from 'react';

import rendererIpc from '../../src/App/RendererIpc';
import {useFindMenu, useZoomMenu} from './OtherMenu';
import useRightClickMenu from './RightClickMenu';

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

export function useContextMenuSetup(
  setElements: Dispatch<SetStateAction<ReactNode[]>>,
  setWidthSize: Dispatch<SetStateAction<'sm' | 'md' | 'lg'>>,
) {
  useRightClickMenu(setElements, setWidthSize);
  useZoomMenu(setElements, setWidthSize);
  useFindMenu(setElements, setWidthSize);
}
