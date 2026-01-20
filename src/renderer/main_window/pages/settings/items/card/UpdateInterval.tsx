import {NumberInput} from '@heroui/react';
import storageIpc from '@lynx_shared/ipc/storage';
import {useDispatch} from 'react-redux';

import {cardsActions, useCardsState} from '../../../../redux/reducers/cards';
import {AppDispatch} from '../../../../redux/store';
import SettingsFilterItem from '../../SettingsFilterItem';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';

export default function CheckUpdateInterval() {
  const updateInterval = useCardsState('checkUpdateInterval');
  const dispatch = useDispatch<AppDispatch>();

  const onChange = (value: number) => {
    if (value) {
      dispatch(cardsActions.setUpdateInterval(value));
      storageIpc.update('cards', {checkUpdateInterval: value});
    }
  };

  return (
    <SettingsFilterItem
      searchTexts={['Update check frequency:', 'update interval', 'card update', 'check for updates', 'minutes']}>
      <div className="w-full text-start flex flex-col gap-y-1">
        <NumberInput
          minValue={2}
          value={updateInterval}
          labelPlacement="outside"
          onValueChange={onChange}
          aria-label="Card Update Interval"
          endContent={<span className="text-sm">Minutes</span>}
          label={<SettingsSearchHighlight text="Update check frequency:" />}
        />
      </div>
    </SettingsFilterItem>
  );
}
