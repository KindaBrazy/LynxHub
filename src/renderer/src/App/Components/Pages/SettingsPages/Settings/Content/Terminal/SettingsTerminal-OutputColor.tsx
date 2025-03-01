import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {terminalActions, useTerminalState} from '../../../../../../Redux/Reducer/TerminalReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';

export default function SettingsTerminalOutputColor() {
  const outputColor = useTerminalState('outputColor');
  const dispatch = useDispatch<AppDispatch>();

  const onEnabledChange = useCallback(
    (value: boolean) => {
      dispatch(terminalActions.setTerminalState({key: 'outputColor', value}));
    },
    [dispatch],
  );

  return (
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
  );
}
