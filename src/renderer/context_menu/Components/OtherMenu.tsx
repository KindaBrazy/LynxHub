import {Button, Input} from '@heroui/react';
import {isEmpty} from 'lodash';
import {Dispatch, ReactNode, SetStateAction, useEffect, useState} from 'react';

import rendererIpc from '../../src/App/RendererIpc';
import {ArrowDuo_Icon, CloseSimple_Icon} from '../../src/assets/icons/SvgIcons/SvgIcons5';

export function useZoomMenu(
  setElements: Dispatch<SetStateAction<ReactNode[]>>,
  setWidthSize: Dispatch<SetStateAction<'sm' | 'md' | 'lg'>>,
) {}

export function useFindMenu(
  setElements: Dispatch<SetStateAction<ReactNode[]>>,
  setWidthSize: Dispatch<SetStateAction<'sm' | 'md' | 'lg'>>,
) {
  const [searchValue, setSearchValue] = useState<string>('');
  const [id, setId] = useState<string>('');

  useEffect(() => {
    if (searchValue) {
      rendererIpc.browser.findInPage(id, searchValue, {findNext: true});
    } else {
      rendererIpc.browser.stopFindInPage(id, 'clearSelection');
    }
  }, [searchValue]);

  const next = () => {
    rendererIpc.browser.findInPage(id, searchValue, {findNext: false, forward: true});
  };
  const back = () => {
    rendererIpc.browser.findInPage(id, searchValue, {findNext: false, forward: false});
  };
  const clear = () => {
    setSearchValue('');
    rendererIpc.browser.stopFindInPage(id, 'clearSelection');
  };

  useEffect(() => {
    if (id) {
      setElements([
        <div key={'find_in_page'} className="p-3 flex flex-row items-end gap-x-2 w-full">
          <Input value={searchValue} placeholder="Type here..." onValueChange={setSearchValue} autoFocus />
          <div className="flex flex-row mb-1 gap-x-1">
            <Button size="sm" onPress={back} variant="light" isDisabled={isEmpty(searchValue)} isIconOnly>
              <ArrowDuo_Icon className="size-4 rotate-90" />
            </Button>
            <Button size="sm" onPress={next} variant="light" isDisabled={isEmpty(searchValue)} isIconOnly>
              <ArrowDuo_Icon className="size-4 -rotate-90" />
            </Button>
            <Button size="sm" variant="light" onPress={clear} isDisabled={isEmpty(searchValue)} isIconOnly>
              <CloseSimple_Icon className="size-3.5 rotate-90" />
            </Button>
          </div>
        </div>,
      ]);
    }
  }, [id, searchValue]);

  useEffect(() => {
    rendererIpc.contextMenu.onFind((_, webID) => {
      setId(webID);

      setWidthSize('md');

      rendererIpc.contextMenu.showWindow();
    });

    return () => {
      rendererIpc.contextMenu.offFind();
    };
  }, [setElements, setWidthSize]);
}
