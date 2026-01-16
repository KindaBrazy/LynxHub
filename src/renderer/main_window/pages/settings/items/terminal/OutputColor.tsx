import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import LynxSwitch from '../../../../components/LynxSwitch';
import {terminalActions, useTerminalState} from '../../../../redux/reducers/terminal';
import {AppDispatch} from '../../../../redux/store';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function OutputColor() {
  const outputColor = useTerminalState('outputColor');
  const dispatch = useDispatch<AppDispatch>();

  const onEnabledChange = useCallback(
    (value: boolean) => {
      dispatch(terminalActions.setTerminalState({key: 'outputColor', value}));
    },
    [dispatch],
  );

  return (
    <SettingsFilterItem
      searchTexts={[
        'Colorize Output Text',
        'colorize output',
        'terminal colors',
        'errors',
        'warnings',
        'success',
        'info',
        'debug',
      ]}>
      <LynxSwitch
        description={
          <span>
            Whether colorize output of terminal text based on: <span className="text-red-600">Errors </span>
            <span className="text-[#ff9900]">Warnings </span> <span className="text-[#00ff00]">Success </span>
            <span className="text-[#0099ff]">Info </span> <span className="text-[#00cccc]">Debug </span> .
          </span>
        }
        size="default"
        enabled={outputColor}
        title="Colorize Output Text"
        onEnabledChange={onEnabledChange}
      />
    </SettingsFilterItem>
  );
}
