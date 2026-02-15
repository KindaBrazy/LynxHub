import LynxSwitch from '@lynx/components/LynxSwitch';
import {terminalActions, useTerminalState} from '@lynx/redux/reducers/terminal';
import {AppDispatch} from '@lynx/redux/store';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

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
