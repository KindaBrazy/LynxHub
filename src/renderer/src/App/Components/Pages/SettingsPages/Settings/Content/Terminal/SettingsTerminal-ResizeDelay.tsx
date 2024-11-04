import {InputNumber} from 'antd';
import {isNull} from 'lodash';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {terminalActions, useTerminalState} from '../../../../../../Redux/App/TerminalReducer';
import {AppDispatch} from '../../../../../../Redux/Store';

export default function SettingsTerminalResizeDelay() {
  const resizeDelay = useTerminalState('resizeDelay');
  const dispatch = useDispatch<AppDispatch>();

  const onChange = useCallback((value: number | null) => {
    if (!isNull(value)) {
      dispatch(terminalActions.setTerminalState({key: 'resizeDelay', value}));
    }
  }, []);

  return (
    <InputNumber
      min={1}
      step={1}
      max={5000}
      className="w-full"
      value={resizeDelay}
      onChange={onChange}
      addonBefore="Resize Delay"
    />
  );
}
