import {Button, Label, Slider} from '@heroui-v3/react';
import browserIpc from '@lynx_shared/ipc/browser';
import storageIpc from '@lynx_shared/ipc/storage';
import {Magnifier, Refresh} from '@solar-icons/react-perf/BoldDuotone';
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
    <div className="flex flex-col gap-4 p-4 w-65">
      {/* Header with title and reset button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Magnifier aria-hidden="true" className="size-5 text-primary" />
          <span className="text-sm font-semibold text-foreground-800">Browser Scale</span>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onPress={handleReset}
          isDisabled={factor === 100}
          aria-label="Reset zoom to 100%">
          <Refresh className="size-4" />
          Reset
        </Button>
      </div>

      {/* Current zoom display */}
      <div aria-live="polite" className="flex items-center justify-center rounded-lg bg-foreground-100 py-3">
        <span className="text-2xl font-bold text-foreground-800">{Math.round(factor)}%</span>
      </div>

      {/* Slider */}
      <div className="flex flex-col gap-3">
        <Slider step={5} minValue={10} value={factor} maxValue={300} onChange={onChange} className="w-full max-w-xs">
          <Label>Volume</Label>
          <Slider.Output>
            {values => {
              return `${values.defaultChildren}%`;
            }}
          </Slider.Output>
          <Slider.Track>
            <Slider.Fill />
            <Slider.Thumb />
          </Slider.Track>
        </Slider>

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
          variant="tertiary"
          className="flex-1"
          aria-label="Decrease zoom by 10%"
          onPress={() => updateZoom(Math.max(10, factor - 10))}>
          −10%
        </Button>
        <Button
          size="sm"
          className="flex-1"
          variant="secondary"
          aria-label="Reset to 100%"
          isDisabled={factor === 100}
          onPress={() => updateZoom(100)}>
          100%
        </Button>
        <Button
          size="sm"
          variant="tertiary"
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
