import {NumberInput} from '@heroui/react';
import {useDispatch} from 'react-redux';

import {Clock_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons';
import {cardsActions, useCardsState} from '../../../../../../Redux/Reducer/CardsReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';

export default function CheckUpdateInterval() {
  const updateInterval = useCardsState('checkUpdateInterval');
  const dispatch = useDispatch<AppDispatch>();

  const onChange = (value: number) => {
    if (value) {
      dispatch(cardsActions.setUpdateInterval(value));
      rendererIpc.storage.update('cards', {checkUpdateInterval: value});
    }
  };

  return (
    <div className="w-full text-start flex flex-col gap-y-1">
      <span>How often to check for AI updates:</span>
      <NumberInput
        size="sm"
        minValue={2}
        endContent="Minutes"
        value={updateInterval}
        onValueChange={onChange}
        aria-label="Card Update Interval"
        startContent={<Clock_Icon className="size-5" />}
      />
    </div>
  );
}
