import {NumberInput} from '@heroui/react';
import {useDispatch} from 'react-redux';

import {terminalActions, useTerminalState} from '../../../../../../Redux/Reducer/TerminalReducer';
import {AppDispatch} from '../../../../../../Redux/Store';

export default function SettingsTerminalResizeDelay() {
  const resizeDelay = useTerminalState('resizeDelay');
  const dispatch = useDispatch<AppDispatch>();

  const onChange = (value: number) => {
    dispatch(terminalActions.setTerminalState({key: 'resizeDelay', value}));
  };

  return (
    <NumberInput
      step={1}
      size="sm"
      minValue={1}
      maxValue={5000}
      value={resizeDelay}
      label="Resize Delay"
      onValueChange={onChange}
    />
  );
}
