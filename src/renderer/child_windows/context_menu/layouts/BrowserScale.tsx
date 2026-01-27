import {Button, Slider} from '@heroui/react';
import browserIpc from '@lynx_shared/ipc/browser';
import storageIpc from '@lynx_shared/ipc/storage';
import {Magnifer, MinimalisticMagnifer, Refresh} from '@solar-icons/react-perf/BoldDuotone';
import {isArray} from 'lodash';
import {memo} from 'react';
import {useDispatch} from 'react-redux';

import {contextActions, useContextState} from '../redux/reducer';
import {ContextDispatch} from '../redux/store';

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
    <div className="flex w-full flex-col gap-4 p-4">
      {/* Header with title and reset button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Magnifer className="size-5 text-primary" />
          <span className="text-sm font-semibold text-foreground-800">Browser Scale</span>
        </div>
        <Button
          size="sm"
          variant="flat"
          color="default"
          onPress={handleReset}
          isDisabled={factor === 100}
          startContent={<Refresh className="size-4" />}
          aria-label="Reset zoom to 100%">
          Reset
        </Button>
      </div>

      {/* Current zoom display */}
      <div className="flex items-center justify-center rounded-lg bg-foreground-100 py-3">
        <span className="text-2xl font-bold text-foreground-800">{factor}%</span>
      </div>

      {/* Slider */}
      <div className="flex flex-col gap-3">
        <Slider
          step={5}
          size="md"
          minValue={10}
          value={factor}
          maxValue={300}
          color="primary"
          fillOffset={100}
          className="w-full"
          onChange={onChange}
          aria-label="Browser zoom level"
          aria-valuetext={`${factor} percent`}
          getValue={value => `${value}%`}
          startContent={<MinimalisticMagnifer className="size-4 text-foreground-500" />}
          endContent={<Magnifer className="size-5 text-foreground-500" />}
          classNames={{
            thumb: 'cursor-default',
            track: 'h-1.5',
            filler: 'bg-primary',
          }}
        />

        {/* Scale markers */}
        <div className="flex justify-between px-1 text-tiny text-foreground-500">
          <button
            onClick={() => updateZoom(10)}
            className="transition-colors hover:text-foreground-800"
            aria-label="Set zoom to 10%">
            10%
          </button>
          <button
            onClick={() => updateZoom(50)}
            className="transition-colors hover:text-foreground-800"
            aria-label="Set zoom to 50%">
            50%
          </button>
          <button
            onClick={() => updateZoom(100)}
            className="font-medium transition-colors hover:text-foreground-800"
            aria-label="Set zoom to 100%">
            100%
          </button>
          <button
            onClick={() => updateZoom(150)}
            className="transition-colors hover:text-foreground-800"
            aria-label="Set zoom to 150%">
            150%
          </button>
          <button
            onClick={() => updateZoom(200)}
            className="transition-colors hover:text-foreground-800"
            aria-label="Set zoom to 200%">
            200%
          </button>
          <button
            onClick={() => updateZoom(300)}
            className="transition-colors hover:text-foreground-800"
            aria-label="Set zoom to 300%">
            300%
          </button>
        </div>
      </div>

      {/* Quick zoom buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="flat"
          className="flex-1"
          onPress={() => updateZoom(Math.max(10, factor - 10))}
          aria-label="Decrease zoom by 10%">
          −10%
        </Button>
        <Button
          size="sm"
          variant="flat"
          className="flex-1"
          onPress={() => updateZoom(100)}
          isDisabled={factor === 100}
          aria-label="Reset to 100%">
          100%
        </Button>
        <Button
          size="sm"
          variant="flat"
          className="flex-1"
          onPress={() => updateZoom(Math.min(300, factor + 10))}
          aria-label="Increase zoom by 10%">
          +10%
        </Button>
      </div>
    </div>
  );
});

export default BrowserScale;
