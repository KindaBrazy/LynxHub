import {NumberInput} from '@heroui/react';
import {useDispatch} from 'react-redux';

import {terminalActions, useTerminalState} from '../../../../redux/reducers/terminal';
import {AppDispatch} from '../../../../redux/store';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function ResizeDelay() {
  const resizeDelay = useTerminalState('resizeDelay');
  const dispatch = useDispatch<AppDispatch>();

  const onChange = (value: number) => {
    dispatch(terminalActions.setTerminalState({key: 'resizeDelay', value}));
  };

  return (
    <SettingsFilterItem searchTexts={['Resize Delay', 'terminal', 'resize delay', 'resize', 'latency']}>
      <NumberInput
        step={1}
        size="sm"
        minValue={1}
        maxValue={5000}
        value={resizeDelay}
        label="Resize Delay"
        onValueChange={onChange}
      />
    </SettingsFilterItem>
  );
}
