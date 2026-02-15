import LynxSwitch from '@lynx/components/LynxSwitch';
import {terminalActions, useTerminalState} from '@lynx/redux/reducers/terminal';
import {AppDispatch} from '@lynx/redux/store';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import SettingsFilterItem from '../../SettingsFilterItem';

export default function BlinkCursor() {
  const blinkCursor = useTerminalState('blinkCursor');
  const dispatch = useDispatch<AppDispatch>();

  const onEnabledChange = useCallback(
    (value: boolean) => {
      dispatch(terminalActions.setTerminalState({key: 'blinkCursor', value}));
    },
    [dispatch],
  );

  const titleText = 'Blink Cursor';
  const descriptionText = 'Whether the cursor blinks.';

  return (
    <SettingsFilterItem searchTexts={[titleText, descriptionText, 'terminal', 'cursor', 'blink']}>
      <LynxSwitch
        size="default"
        title={titleText}
        enabled={blinkCursor}
        description={descriptionText}
        onEnabledChange={onEnabledChange}
      />
    </SettingsFilterItem>
  );
}
