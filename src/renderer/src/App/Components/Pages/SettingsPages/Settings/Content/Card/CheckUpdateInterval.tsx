import {NumberInput} from '@heroui/react';
import {useDispatch} from 'react-redux';

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
      <NumberInput
        minValue={2}
        value={updateInterval}
        labelPlacement="outside"
        onValueChange={onChange}
        label="Update check frequency:"
        aria-label="Card Update Interval"
        endContent={<span className="text-sm">Minutes</span>}
      />
    </div>
  );
}
