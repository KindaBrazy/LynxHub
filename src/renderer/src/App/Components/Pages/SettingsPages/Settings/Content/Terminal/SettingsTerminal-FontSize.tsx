import {NumberInput} from '@heroui/react';
import {useDispatch} from 'react-redux';

import {terminalActions, useTerminalState} from '../../../../../../Redux/Reducer/TerminalReducer';
import {AppDispatch} from '../../../../../../Redux/Store';

export default function SettingsTerminalFontSize() {
  const fontSize = useTerminalState('fontSize');
  const dispatch = useDispatch<AppDispatch>();

  const onChange = (value: number) => {
    dispatch(terminalActions.setTerminalState({key: 'fontSize', value}));
  };

  return (
    <NumberInput size="sm" minValue={2} maxValue={100} value={fontSize} label="Font Size" onValueChange={onChange} />
  );
}
