import {NumberInput} from '@heroui/react';
import {useDispatch} from 'react-redux';

import {terminalActions, useTerminalState} from '../../../../redux/reducers/terminal';
import {AppDispatch} from '../../../../redux/store';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function FontSize() {
  const fontSize = useTerminalState('fontSize');
  const dispatch = useDispatch<AppDispatch>();

  const onChange = (value: number) => {
    dispatch(terminalActions.setTerminalState({key: 'fontSize', value}));
  };

  return (
    <SettingsFilterItem searchTexts={['Font Size', 'terminal', 'font size', 'text size']}>
      <NumberInput size="sm" minValue={2} maxValue={100} value={fontSize} label="Font Size" onValueChange={onChange} />
    </SettingsFilterItem>
  );
}
