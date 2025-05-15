import {Button, Input, Slider} from '@heroui/react';
import {isArray, isEmpty} from 'lodash';
import {useEffect, useState} from 'react';

import rendererIpc from '../../src/App/RendererIpc';
import {ArrowDuo_Icon, CloseSimple_Icon} from '../../src/assets/icons/SvgIcons/SvgIcons';
import {SetElementsType, SetWidthSizeType} from './ContextHooks';

export function useZoomMenu(setElements: SetElementsType, setWidthSize: SetWidthSizeType) {
  const [id, setId] = useState<string>('');
  const [value, setValue] = useState<number>(100);
  const [toggle, setToggle] = useState<boolean>(false);

  const updateZoom = (zoom: number) => {
    setValue(zoom);
    rendererIpc.browser.setZoomFactor(id, zoom / 100);
    rendererIpc.storageUtils.updateZoomFactor(zoom / 100);
  };

  const onChange = (value: number | number[]) => {
    if (!isArray(value)) updateZoom(value);
  };

  const handleReset = () => {
    updateZoom(100);
  };

  useEffect(() => {
    if (id) {
      setElements([
        <div key="zoom_page" className="p-3 pr-6 flex flex-row gap-x-2 gap-y-4 border-2 border-foreground/10">
          <Button size="sm" variant="light" onPress={handleReset} className="h-14 cursor-default">
            Reset
          </Button>
          <Slider
            marks={[
              {value: 10, label: '10'},
              {value: 100, label: '100'},
              {value: 200, label: '200'},
              {value: 300, label: '300'},
            ]}
            step={5}
            size="sm"
            minValue={10}
            value={value}
            maxValue={300}
            color="primary"
            fillOffset={100}
            className="w-52"
            onChange={onChange}
            label="Browser Scale"
            aria-label="Zoom Factor"
            getValue={value => `${value}%`}
            classNames={{thumb: 'cursor-default'}}
          />
        </div>,
      ]);
    }
  }, [id, value, toggle]);

  useEffect(() => {
    rendererIpc.contextMenu.onZoom((_, webID, zoomFactor) => {
      setId(webID);

      setValue(zoomFactor * 100);

      setWidthSize('md');

      setToggle(prevState => !prevState);

      rendererIpc.contextMenu.showWindow();
    });

    return () => {
      rendererIpc.contextMenu.offZoom();
    };
  }, [setElements, setWidthSize]);
}

export function useFindMenu(setElements: SetElementsType, setWidthSize: SetWidthSizeType) {
  const [searchValue, setSearchValue] = useState<string>('');
  const [id, setId] = useState<string>('');

  const [toggle, setToggle] = useState<boolean>(false);

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
  }, [id, searchValue, toggle]);

  useEffect(() => {
    rendererIpc.contextMenu.onFind((_, webID) => {
      setToggle(prevState => !prevState);
      setId(webID);

      setWidthSize('md');

      rendererIpc.contextMenu.showWindow();
    });

    return () => {
      rendererIpc.contextMenu.offFind();
    };
  }, [setElements, setWidthSize]);
}
