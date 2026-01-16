import {Select, Selection, SelectItem} from '@heroui/react';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {TerminalCursorStyle} from '../../../../../../cross/IpcChannelAndTypes';
import {terminalActions, useTerminalState} from '../../../../redux/reducers/terminal';
import {AppDispatch} from '../../../../redux/store';
import SettingsFilterItem from '../../SettingsFilterItem';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';

export default function CursorStyle() {
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

  const labelText = 'Cursor Style';
  const descriptionText = 'Select the appearance of cursor.';

  return (
    <SettingsFilterItem searchTexts={[labelText, descriptionText, 'cursor', 'style', 'terminal']}>
      <Select
        className="my-0!"
        labelPlacement="outside"
        selectedKeys={[cursorStyle]}
        onSelectionChange={onChange}
        label={<SettingsSearchHighlight text={labelText} />}
        description={<SettingsSearchHighlight text={descriptionText} />}
        classNames={{trigger: 'cursor-default transition! duration-300!', mainWrapper: 'mt-2'}}
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
    </SettingsFilterItem>
  );
}
