import {Button, Input, Slider} from '@heroui/react';
import {Magnifer, Refresh} from '@solar-icons/react-perf/BoldDuotone';
import {AltArrowDown, AltArrowUp} from '@solar-icons/react-perf/Linear';
import {isArray, isEmpty} from 'lodash';
import {X} from 'lucide-react';
import type {KeyboardEvent} from 'react';
import {useEffect, useRef, useState} from 'react';

import rendererIpc from '../../../main_window/services/RendererIpc';
import {Circle_Icon} from '../../../shared/assets/icons';
import {SetElementsType, SetWidthSizeType} from '../hooks';

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
        <div key="zoom_page" className="p-3 pr-6 flex flex-row gap-x-2 gap-y-4">
          <Button size="sm" variant="flat" className="h-17" onPress={handleReset} isDisabled={value === 100}>
            <Refresh className="size-5" />
          </Button>
          <Slider
            label={
              <div className="flex flex-row items-center gap-x-2">
                <Magnifer />
                <span>Browser Scale</span>
              </div>
            }
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
            aria-label="Zoom Factor"
            getValue={value => `${value}%`}
            classNames={{thumb: 'cursor-default'}}
          />
        </div>,
      ]);
    }
  }, [id, value, toggle]);

  useEffect(() => {
    const offZoom = rendererIpc.contextMenu.onZoom((_, webID, zoomFactor) => {
      setId(webID);
      setValue(zoomFactor * 100);
      setWidthSize('md');
      setToggle(prevState => !prevState);
      rendererIpc.contextMenu.showWindow();
    });

    // Clear state when other menus open
    const clearState = () => setId('');
    const offInitView = rendererIpc.contextMenu.onInitView(clearState);
    const offFind = rendererIpc.contextMenu.onFind(clearState);
    const offVolume = rendererIpc.contextMenu.onVolume(clearState);
    const offTerminateAI = rendererIpc.contextMenu.onTerminateAI(clearState);
    const offTerminateTab = rendererIpc.contextMenu.onTerminateTab(clearState);
    const offCloseApp = rendererIpc.contextMenu.onCloseApp(clearState);

    return () => {
      offZoom();
      offInitView();
      offFind();
      offVolume();
      offTerminateAI();
      offTerminateTab();
      offCloseApp();
    };
  }, [setElements, setWidthSize]);
}

export function useFindMenu(setElements: SetElementsType, setWidthSize: SetWidthSizeType) {
  const [searchValue, setSearchValue] = useState<string>('');
  const [id, setId] = useState<string>('');
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    // Refocus input after clearing
    if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    focusTimeoutRef.current = setTimeout(() => inputRef?.focus(), 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (isEmpty(searchValue)) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      back();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      clear();
      rendererIpc.contextMenu.hideWindow();
    }
  };

  // Clear search when window closes
  useEffect(() => {
    const handleWindowBlur = () => {
      setSearchValue(currentValue => {
        if (currentValue) {
          rendererIpc.browser.stopFindInPage(id, 'clearSelection');
        }
        return '';
      });
    };

    window.addEventListener('blur', handleWindowBlur);
    return () => window.removeEventListener('blur', handleWindowBlur);
  }, [id]);

  useEffect(() => {
    if (id) {
      setElements([
        <div key={`${id}_${toggle}`} className="flex w-full flex-row items-end gap-x-2 p-3">
          <Input
            ref={setInputRef}
            value={searchValue}
            onKeyDown={handleKeyDown}
            placeholder="Type to find..."
            startContent={<Circle_Icon />}
            onValueChange={setSearchValue}
            autoFocus
          />
          <div className="mb-1 flex flex-row gap-x-1">
            <Button size="sm" onPress={back} variant="light" isDisabled={isEmpty(searchValue)} isIconOnly>
              <AltArrowUp className="size-4" />
            </Button>
            <Button size="sm" onPress={next} variant="light" isDisabled={isEmpty(searchValue)} isIconOnly>
              <AltArrowDown className="size-4" />
            </Button>
            <Button size="sm" variant="light" onPress={clear} isDisabled={isEmpty(searchValue)} isIconOnly>
              <X className="size-4" />
            </Button>
          </div>
        </div>,
      ]);
    }
  }, [id, searchValue, toggle, inputRef]);

  useEffect(() => {
    const offFind = rendererIpc.contextMenu.onFind((_, webID) => {
      setToggle(prevState => !prevState);
      setId(webID);
      setWidthSize('md');
      rendererIpc.contextMenu.showWindow();
    });

    // Clear state when other menus open
    const clearState = () => {
      setId('');
      setSearchValue('');
    };
    const offInitView = rendererIpc.contextMenu.onInitView(clearState);
    const offZoom = rendererIpc.contextMenu.onZoom(clearState);
    const offVolume = rendererIpc.contextMenu.onVolume(clearState);
    const offTerminateAI = rendererIpc.contextMenu.onTerminateAI(clearState);
    const offTerminateTab = rendererIpc.contextMenu.onTerminateTab(clearState);
    const offCloseApp = rendererIpc.contextMenu.onCloseApp(clearState);

    return () => {
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
      offFind();
      offInitView();
      offZoom();
      offVolume();
      offTerminateAI();
      offTerminateTab();
      offCloseApp();
    };
  }, [setElements, setWidthSize]);
}
