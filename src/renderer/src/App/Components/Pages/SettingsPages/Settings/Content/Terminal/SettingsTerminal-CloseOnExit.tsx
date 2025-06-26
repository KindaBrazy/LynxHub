import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {terminalActions, useTerminalState} from '../../../../../../Redux/Reducer/TerminalReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';

export default function SettingsTerminalCloseOnExit() {
  const closeTabOnExit = useTerminalState('closeTabOnExit');
  const dispatch = useDispatch<AppDispatch>();

  const onEnabledChange = useCallback(
    (value: boolean) => {
      dispatch(terminalActions.setTerminalState({key: 'closeTabOnExit', value}));
    },
    [dispatch],
  );

  return (
    <LynxSwitch
      size="default"
      enabled={closeTabOnExit}
      onEnabledChange={onEnabledChange}
      title="Close Tab on Terminal Exit"
      description="Automatically close tab contain terminal when the assigned process exits"
    />
  );
}
