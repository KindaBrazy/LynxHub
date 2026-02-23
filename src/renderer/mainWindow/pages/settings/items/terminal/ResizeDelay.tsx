import {NumberInput} from '@heroui/react';
import {terminalActions, useTerminalState} from '@lynx/redux/reducers/terminal';
import {AppDispatch} from '@lynx/redux/store';
import {useDispatch} from 'react-redux';

import SettingsFilterItem from '../../SettingsFilterItem';

/**
 * Settings component that configures the latency/delay used during terminal viewport resizing.
 * Updates the 'resizeDelay' state in REDUX.
 */
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
