import {Select, Selection, SelectItem} from '@heroui/react';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {TerminalUseConpty} from '../../../../../../../../../cross/IpcChannelAndTypes';
import {terminalActions, useTerminalState} from '../../../../../../Redux/Reducer/TerminalReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import SettingsFilterItem from '../../SettingsFilterItem';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';

export default function SettingsTerminalConpty() {
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
        labelPlacement="outside"
        selectedKeys={[useConpty]}
        onSelectionChange={onChange}
        label={<SettingsSearchHighlight text={labelText} />}
        description={<SettingsSearchHighlight text={descriptionText} />}
        classNames={{trigger: 'cursor-default !transition !duration-300'}}
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
