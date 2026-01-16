import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import LynxSwitch from '../../../../components/LynxSwitch';
import {terminalActions, useTerminalState} from '../../../../redux/reducers/terminal';
import {AppDispatch} from '../../../../redux/store';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function CloseOnExit() {
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
