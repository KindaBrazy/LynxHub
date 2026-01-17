import {Button, Slider} from '@heroui/react';
import rendererIpc from '@lynx/ipc';
import {Magnifer, Refresh} from '@solar-icons/react-perf/BoldDuotone';
import {isArray} from 'lodash';
import {useEffect, useState} from 'react';

import {MenuTypes} from '../consts';
import {CommonProps} from '../types';

export function BrowserScale({setSelectedLayout, setWidthSize, show}: CommonProps) {
  const [id, setId] = useState<string>('');
  const [value, setValue] = useState<number>(100);

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
    const offZoom = rendererIpc.contextMenu.onZoom((_, webID, zoomFactor) => {
      setId(webID);
      setValue(zoomFactor * 100);

      setWidthSize('md');
      setSelectedLayout(MenuTypes.BrowserScale);

      rendererIpc.contextMenu.showWindow();
    });

    return () => {
      setId('');
      offZoom();
    };
  }, [setWidthSize]);

  if (!show) return null;

  return (
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
    </div>
  );
}
