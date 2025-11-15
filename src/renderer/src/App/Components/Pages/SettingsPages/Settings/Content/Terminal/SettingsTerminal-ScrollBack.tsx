import {NumberInput} from '@heroui/react';
import {useDispatch} from 'react-redux';

import {terminalActions, useTerminalState} from '../../../../../../Redux/Reducer/TerminalReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function SettingsTerminalScrollBack() {
  const scrollBack = useTerminalState('scrollBack');
  const dispatch = useDispatch<AppDispatch>();

  const onChange = (value: number) => {
    dispatch(terminalActions.setTerminalState({key: 'scrollBack', value}));
  };

  return (
    <SettingsFilterItem searchTexts={["Scrollback", 'terminal', 'scrollback', 'buffer', 'history']}>
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
