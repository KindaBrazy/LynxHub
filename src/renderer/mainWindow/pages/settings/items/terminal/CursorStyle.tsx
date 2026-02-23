import {Select, Selection, SelectItem} from '@heroui/react';
import {terminalActions, useTerminalState} from '@lynx/redux/reducers/terminal';
import {AppDispatch} from '@lynx/redux/store';
import {TerminalCursorStyle} from '@lynx_common/types/ipc';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import SettingsFilterItem from '../../SettingsFilterItem';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';

/**
 * Settings component that allows the user to select the appearance of the terminal cursor.
 * Updates the 'cursorStyle' state in REDUX.
 */
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
