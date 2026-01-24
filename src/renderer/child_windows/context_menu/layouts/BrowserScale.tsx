import {Button, Slider} from '@heroui/react';
import {contextActions, useContextState} from '@lynx/redux/reducer';
import {ContextDispatch} from '@lynx/redux/store';
import browserIpc from '@lynx_shared/ipc/browser';
import storageIpc from '@lynx_shared/ipc/storage';
import {Magnifer, Refresh} from '@solar-icons/react-perf/BoldDuotone';
import {isArray} from 'lodash';
import {memo} from 'react';
import {useDispatch} from 'react-redux';

const BrowserScale = memo(() => {
  const {id, factor} = useContextState('browserScale');

  const dispatch = useDispatch<ContextDispatch>();

  const updateZoom = (zoom: number) => {
    dispatch(contextActions.updateZoomFactor(zoom));
    browserIpc.send.setZoomFactor(id, zoom / 100);
    storageIpc.update('cards', {zoomFactor: zoom / 100});
  };

  const onChange = (value: number | number[]) => {
    if (!isArray(value)) updateZoom(value);
  };

  const handleReset = () => {
    updateZoom(100);
  };

  return (
    <div className="p-3 pr-6 flex flex-row gap-x-2 gap-y-4">
      <Button size="sm" variant="flat" className="h-17" onPress={handleReset} isDisabled={factor === 100}>
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
        value={factor}
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
});

export default BrowserScale;
