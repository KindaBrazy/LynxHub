import {Button, Popover, PopoverContent, PopoverTrigger, Slider} from '@heroui/react';
import {WebviewTag} from 'electron';
import {isArray} from 'lodash';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {Magnifier_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons4';
import {cardsActions, useCardsState} from '../../../Redux/Reducer/CardsReducer';
import {AppDispatch} from '../../../Redux/Store';
import {useWebviewPress} from '../../../Utils/UtilHooks';

type Props = {webview: WebviewTag | null; id: string};
export default function Browser_Zoom({id, webview}: Props) {
  const zoomFactor = useCardsState('webViewZoomFactor');
  const dispatch = useDispatch<AppDispatch>();
  const [value, setValue] = useState<number>(100);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useWebviewPress(webview, () => setIsOpen(false));

  useEffect(() => {
    const factor = zoomFactor.find(zoom => zoom.id === id);
    if (factor) {
      setValue(factor.zoom * 100);
    } else {
      setValue(100);
    }
  }, [id, zoomFactor]);

  const onChange = useCallback((value: number | number[]) => {
    if (!isArray(value)) {
      setValue(value);
      dispatch(cardsActions.updateZoomFactor({id, zoom: value / 100}));
    }
  }, []);

  const resetHandle = useCallback(() => {
    dispatch(cardsActions.updateZoomFactor({id, zoom: 1.0}));
  }, [id]);
  return (
    <Popover shadow="sm" isOpen={isOpen} placement="bottom-end" onOpenChange={setIsOpen} showArrow shouldCloseOnBlur>
      <PopoverTrigger>
        <Button size="sm" variant="light" className="cursor-default" isIconOnly>
          <Magnifier_Icon className="size-4" />
        </Button>
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
          className="w-52"
          onChange={onChange}
          label="Browser Scale"
          aria-label="Zoom Factor"
          getValue={value => `${value}%`}
          classNames={{thumb: 'cursor-default'}}
        />
      </PopoverContent>
    </Popover>
  );
}
