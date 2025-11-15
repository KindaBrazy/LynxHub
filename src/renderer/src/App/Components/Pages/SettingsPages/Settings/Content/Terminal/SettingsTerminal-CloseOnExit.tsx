import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {terminalActions, useTerminalState} from '../../../../../../Redux/Reducer/TerminalReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function SettingsTerminalCloseOnExit() {
  const closeTabOnExit = useTerminalState('closeTabOnExit');
  const dispatch = useDispatch<AppDispatch>();

  const onEnabledChange = useCallback(
    (value: boolean) => {
      dispatch(terminalActions.setTerminalState({key: 'closeTabOnExit', value}));
    },
    [dispatch],
  );

  const titleText = 'Close Tab on Terminal Exit';
  const descriptionText = 'Automatically close tab contain terminal when the assigned process exits';

  return (
    <SettingsFilterItem
      searchTexts={[titleText, descriptionText, 'terminal', 'close tab', 'process exit', 'auto close']}>
      <LynxSwitch
        size="default"
        title={titleText}
        enabled={closeTabOnExit}
        description={descriptionText}
        onEnabledChange={onEnabledChange}
      />
    </SettingsFilterItem>
  );
}
