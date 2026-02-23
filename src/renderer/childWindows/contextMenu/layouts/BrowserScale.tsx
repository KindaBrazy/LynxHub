import {Button, Slider} from '@heroui/react';
import browserIpc from '@lynx_shared/ipc/browser';
import storageIpc from '@lynx_shared/ipc/storage';
import {
  Magnifer,
  MinimalisticMagniferZoomIn,
  MinimalisticMagniferZoomOut,
  Refresh,
} from '@solar-icons/react-perf/BoldDuotone';
import {isArray} from 'lodash';
import {memo, useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {contextActions, useContextState} from '../redux/reducer';
import {ContextDispatch} from '../redux/store';

/**
 * BrowserScale Component
 * Allows the user to adjust the zoom level of the browser.
 */
const BrowserScale = memo(function BrowserScale() {
  const {id, factor} = useContextState('browserScale');

  const dispatch = useDispatch<ContextDispatch>();

  const updateZoom = useCallback(
    (zoom: number) => {
      dispatch(contextActions.updateZoomFactor(zoom));
      browserIpc.send.setZoomFactor(id, zoom / 100);
      storageIpc.update('cards', {zoomFactor: zoom / 100});
    },
    [dispatch, id],
  );

  const onChange = useCallback(
    (value: number | number[]) => {
      if (!isArray(value)) updateZoom(value);
    },
    [updateZoom],
  );

  const handleReset = useCallback(() => {
    updateZoom(100);
  }, [updateZoom]);

  return (
    <div className="flex w-full flex-col gap-4 p-4">
      {/* Header with title and reset button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Magnifer aria-hidden="true" className="size-5 text-primary" />
          <span className="text-sm font-semibold text-foreground-800">Browser Scale</span>
        </div>
        <Button
          size="sm"
          variant="flat"
          color="default"
          onPress={handleReset}
          isDisabled={factor === 100}
          aria-label="Reset zoom to 100%"
          startContent={<Refresh className="size-4" />}>
          Reset
        </Button>
      </div>

      {/* Current zoom display */}
      <div aria-live="polite" className="flex items-center justify-center rounded-lg bg-foreground-100 py-3">
        <span className="text-2xl font-bold text-foreground-800">{Math.round(factor)}%</span>
      </div>

      {/* Slider */}
      <div className="flex flex-col gap-3">
        <Slider
          classNames={{
            thumb: 'cursor-default',
            track: 'h-1.5',
            filler: 'bg-primary',
          }}
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
          getValue={value => `${value}%`}
          aria-valuetext={`${factor} percent`}
          endContent={<MinimalisticMagniferZoomIn aria-hidden="true" className="size-5 text-foreground-500" />}
          startContent={<MinimalisticMagniferZoomOut aria-hidden="true" className="size-4 text-foreground-500" />}
        />

        {/* Scale markers */}
        <div className="flex justify-between px-1 text-tiny text-foreground-500">
          {[10, 50, 100, 150, 200, 300].map(zoom => (
            <button
              key={zoom}
              onClick={() => updateZoom(zoom)}
              aria-label={`Set zoom to ${zoom}%`}
              className={`transition-colors hover:text-foreground-800 ${zoom === 100 ? 'font-medium' : ''}`}>
              {zoom}%
            </button>
          ))}
        </div>
      </div>

      {/* Quick zoom buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="flat"
          className="flex-1"
          aria-label="Decrease zoom by 10%"
          onPress={() => updateZoom(Math.max(10, factor - 10))}>
          −10%
        </Button>
        <Button
          size="sm"
          variant="flat"
          className="flex-1"
          aria-label="Reset to 100%"
          isDisabled={factor === 100}
          onPress={() => updateZoom(100)}>
          100%
        </Button>
        <Button
          size="sm"
          variant="flat"
          className="flex-1"
          aria-label="Increase zoom by 10%"
          onPress={() => updateZoom(Math.min(300, factor + 10))}>
          +10%
        </Button>
      </div>
    </div>
  );
});

export default BrowserScale;
