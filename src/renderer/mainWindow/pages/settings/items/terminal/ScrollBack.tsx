import {Label, NumberField} from '@heroui-v3/react';
import {terminalActions, useTerminalState} from '@lynx/redux/reducers/terminal';
import {AppDispatch} from '@lynx/redux/store';
import {useDispatch} from 'react-redux';

import SettingsFilterItem from '../../SettingsFilterItem';

/**
 * Settings component that controls the amount of scrollback buffer history retained in the terminal.
 * Updates the 'scrollBack' state in REDUX.
 */
export default function ScrollBack() {
  const scrollBack = useTerminalState('scrollBack');
  const dispatch = useDispatch<AppDispatch>();

  const onChange = (value: number) => {
    dispatch(terminalActions.setTerminalState({key: 'scrollBack', value}));
  };

  return (
    <SettingsFilterItem searchTexts={['Scrollback', 'terminal', 'scrollback', 'buffer', 'history']}>
      <NumberField
        step={100}
        minValue={100}
        maxValue={999999}
        value={scrollBack}
        onChange={onChange}
        aria-label="Terminal scrollback">
        <Label>Scrollback</Label>
        <NumberField.Group>
          <NumberField.DecrementButton />
          <NumberField.Input />
          <NumberField.IncrementButton />
        </NumberField.Group>
      </NumberField>
    </SettingsFilterItem>
  );
}
