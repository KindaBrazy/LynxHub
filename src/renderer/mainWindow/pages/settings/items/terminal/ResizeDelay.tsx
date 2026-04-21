import {Label, NumberField} from '@heroui-v3/react';
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
      <NumberField
        step={1}
        minValue={1}
        maxValue={5000}
        value={resizeDelay}
        onChange={onChange}
        aria-label="Terminal resize delay">
        <Label>Resize Delay</Label>
        <NumberField.Group>
          <NumberField.DecrementButton />
          <NumberField.Input />
          <NumberField.IncrementButton />
        </NumberField.Group>
      </NumberField>
    </SettingsFilterItem>
  );
}
