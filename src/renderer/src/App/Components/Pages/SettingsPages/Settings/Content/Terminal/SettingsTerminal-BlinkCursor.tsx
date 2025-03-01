import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {terminalActions, useTerminalState} from '../../../../../../Redux/Reducer/TerminalReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';

export default function SettingsTerminalBlinkCursor() {
  const blinkCursor = useTerminalState('blinkCursor');
  const dispatch = useDispatch<AppDispatch>();

  const onEnabledChange = useCallback(
    (value: boolean) => {
      dispatch(terminalActions.setTerminalState({key: 'blinkCursor', value}));
    },
    [dispatch],
  );

  return (
    <LynxSwitch
      size="default"
      title="Blink Cursor"
      enabled={blinkCursor}
      onEnabledChange={onEnabledChange}
      description="Whether the cursor blinks."
    />
  );
}
