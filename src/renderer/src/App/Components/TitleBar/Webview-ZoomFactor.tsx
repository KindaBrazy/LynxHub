import {Button, Popover, PopoverContent, PopoverTrigger, Slider} from '@nextui-org/react';
import {isArray} from 'lodash';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {cardsActions, useCardsState} from '../../Redux/AI/CardsReducer';
import {AppDispatch} from '../../Redux/Store';
import SmallButton from '../Reusable/SmallButton';

export default function WebviewZoomFactor() {
  const {id} = useCardsState('runningCard');
  const zoomFactor = useCardsState('webViewZoomFactor');
  const dispatch = useDispatch<AppDispatch>();
  const [value, setValue] = useState<number>(100);

  useEffect(() => {
    const factor = zoomFactor.find(zoom => zoom.id === id);
    if (factor) {
      setValue(factor.zoom * 100);
    } else {
      setValue(100);
    }
  }, [id, zoomFactor]);

  const onChangeEnd = useCallback(
    (value: number | number[]) => {
      if (!isArray(value)) {
        dispatch(cardsActions.updateZoomFactor({id, zoom: value / 100}));
      }
    },
    [id],
  );

  const onChange = useCallback((value: number | number[]) => {
    if (!isArray(value)) setValue(value);
  }, []);

  const resetHandle = useCallback(() => {
    dispatch(cardsActions.updateZoomFactor({id, zoom: 1.0}));
  }, [id]);

  return (
    <Popover className="!shadow-small" showArrow shouldCloseOnBlur>
      <PopoverTrigger>
        <a>
          <SmallButton icon="Magnifier" iconClassName="m-[8px]" />
        </a>
      </PopoverTrigger>
      <PopoverContent className="flex-row gap-x-2 gap-y-4 border-2 border-foreground/10 py-2 pr-6">
        <Button size="sm" variant="light" onPress={resetHandle} className="h-14 cursor-default">
          Reset
        </Button>
        <Slider
          marks={[
            {value: 10, label: '10%'},
            {value: 100, label: '100%'},
            {value: 200, label: '200%'},
            {value: 300, label: '300%'},
          ]}
          step={5}
          size="sm"
          minValue={10}
          value={value}
          maxValue={300}
          color="primary"
          fillOffset={100}
          className="w-40"
          onChange={onChange}
          label="Browser Scale"
          aria-label="Zoom Factor"
          onChangeEnd={onChangeEnd}
          getValue={value => `${value}%`}
          classNames={{thumb: 'cursor-default'}}
        />
      </PopoverContent>
    </Popover>
  );
}
