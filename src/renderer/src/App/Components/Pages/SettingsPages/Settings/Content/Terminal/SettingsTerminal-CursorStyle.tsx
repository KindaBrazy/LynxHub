import {Select, Selection, SelectItem} from '@nextui-org/react';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {TerminalCursorStyle} from '../../../../../../../../../cross/IpcChannelAndTypes';
import {terminalActions, useTerminalState} from '../../../../../../Redux/App/TerminalReducer';
import {AppDispatch} from '../../../../../../Redux/Store';

export default function SettingsTerminalCursorStyle() {
  const cursorStyle = useTerminalState('cursorStyle');
  const dispatch = useDispatch<AppDispatch>();

  const onChange = useCallback(
    (keys: Selection) => {
      if (keys !== 'all') {
        const value = keys.values().next().value as TerminalCursorStyle;
        dispatch(terminalActions.setTerminalState({key: 'cursorStyle', value}));
      }
    },
    [dispatch],
  );

  return (
    <Select
      label="Cursor Style"
      labelPlacement="outside"
      selectedKeys={[cursorStyle]}
      onSelectionChange={onChange}
      description="Select the appearance of cursor."
      classNames={{trigger: 'cursor-default !transition !duration-300', mainWrapper: 'mt-2'}}
      disallowEmptySelection>
      <SelectItem key="bar" className="cursor-default">
        Bar
      </SelectItem>
      <SelectItem key="block" className="cursor-default">
        Block
      </SelectItem>
      <SelectItem key="underline" className="cursor-default">
        Underline
      </SelectItem>
    </Select>
  );
}
