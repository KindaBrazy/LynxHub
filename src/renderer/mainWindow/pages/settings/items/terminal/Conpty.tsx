import {Select, Selection, SelectItem} from '@heroui/react';
import {terminalActions, useTerminalState} from '@lynx/redux/reducers/terminal';
import {AppDispatch} from '@lynx/redux/store';
import {TerminalUseConpty} from '@lynx_common/types/ipc';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import SettingsFilterItem from '../../SettingsFilterItem';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';

/**
 * Settings component that allows the user to select whether to use ConPTY on Windows
 * for terminal sessions (Auto, Yes, or No). Updates the 'useConpty' state in REDUX.
 */
export default function Conpty() {
  const useConpty = useTerminalState('useConpty');
  const dispatch = useDispatch<AppDispatch>();

  const onChange = useCallback(
    (keys: Selection) => {
      if (keys !== 'all') {
        const value = keys.values().next().value as TerminalUseConpty;
        dispatch(terminalActions.setTerminalState({key: 'useConpty', value}));
      }
    },
    [dispatch],
  );

  const labelText = 'Use Conpty (Windows)';
  const descriptionText = 'Use the ConPTY system on Windows.';

  return (
    <SettingsFilterItem searchTexts={[labelText, descriptionText, 'terminal', 'conpty', 'windows', 'pty']}>
      <Select
        className="my-0!"
        labelPlacement="outside"
        selectedKeys={[useConpty]}
        onSelectionChange={onChange}
        label={<SettingsSearchHighlight text={labelText} />}
        description={<SettingsSearchHighlight text={descriptionText} />}
        classNames={{trigger: 'cursor-default transition! duration-300!'}}
        disallowEmptySelection>
        <SelectItem key="auto" className="cursor-default">
          Auto
        </SelectItem>
        <SelectItem key="yes" className="cursor-default">
          Yes
        </SelectItem>
        <SelectItem key="no" className="cursor-default">
          No
        </SelectItem>
      </Select>
    </SettingsFilterItem>
  );
}
