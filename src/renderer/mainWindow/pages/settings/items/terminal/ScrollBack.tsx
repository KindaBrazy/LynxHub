import { NumberInput } from '@heroui/react';
import { terminalActions, useTerminalState } from '@lynx/redux/reducers/terminal';
import { AppDispatch } from '@lynx/redux/store';
import { useDispatch } from 'react-redux';

import SettingsFilterItem from '../../SettingsFilterItem';

/**
 * Settings component that controls the amount of scrollback buffer history retained in the terminal.
 * Updates the 'scrollBack' state in REDUX.
 */
export default function ScrollBack() {
  const scrollBack = useTerminalState('scrollBack');
  const dispatch = useDispatch<AppDispatch>();

  const onChange = (value: number) => {
    dispatch(terminalActions.setTerminalState({ key: 'scrollBack', value }));
  };

  return (
    <SettingsFilterItem searchTexts={['Scrollback', 'terminal', 'scrollback', 'buffer', 'history']}>
      <NumberInput
        size="sm"
        step={100}
        minValue={100}
        maxValue={999999}
        label="Scrollback"
        value={scrollBack}
        onValueChange={onChange}
      />
    </SettingsFilterItem>
  );
}
