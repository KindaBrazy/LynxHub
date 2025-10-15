import {NumberInput} from '@heroui/react';
import {useDispatch} from 'react-redux';

import {terminalActions, useTerminalState} from '../../../../../../Redux/Reducer/TerminalReducer';
import {AppDispatch} from '../../../../../../Redux/Store';

export default function SettingsTerminalScrollBack() {
  const scrollBack = useTerminalState('scrollBack');
  const dispatch = useDispatch<AppDispatch>();

  const onChange = (value: number) => {
    dispatch(terminalActions.setTerminalState({key: 'scrollBack', value}));
  };

  return (
    <NumberInput
      size="sm"
      step={1000}
      minValue={100}
      maxValue={999999}
      label="Scrollback"
      value={scrollBack}
      onValueChange={onChange}
    />
  );
}
