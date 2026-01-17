import {Button, Input, Listbox, ListboxItem, ListboxSection} from '@heroui/react';
import {
  Get_Default_Hotkeys,
  Hotkey_Desc,
  Hotkey_Names,
  Hotkey_Sections,
  Hotkey_Titles,
} from '@lynx_cross/consts/hotkeys';
import {LynxHotkey} from '@lynx_cross/types/ipc';
import {compact} from 'lodash';
import {KeyboardEvent, useCallback, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {Keyboard_Icon, RefreshDuo_Icon} from '../../../../../shared/assets/icons';
import SettingsSection from '../../../../components/ContentSection';
import rendererIpc from '../../../../ipc';
import {hotkeysActions, useHotkeysState} from '../../../../redux/reducers/hotkeys';
import {useSettingsState} from '../../../../redux/reducers/settings';
import {useTerminalState} from '../../../../redux/reducers/terminal';
import {AppDispatch} from '../../../../redux/store';
import {formatHotkey, HotkeyLike} from '../../../../utils';
import {canSettingItemShow} from '../../SettingsFilterItem';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';

export const SettingsHotkeysId = 'settings_hotkeys_elem';

const isModifierKey = (key: string): boolean => {
  return ['control', 'shift', 'alt', 'meta', 'os'].includes(key.toLowerCase());
};

export const HotkeySettings = () => {
  const hotkeys = useHotkeysState('hotkeys');
  const quickCommands = useTerminalState('quickCommands');
  const [recordingName, setRecordingName] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const dispatch = useDispatch<AppDispatch>();
  const searchValue = useSettingsState('searchValue');

  const quickCommandLabelMap = useMemo(() => {
    const labels: Partial<Record<string, string>> = {};

    const hotkeyToIndex: Record<string, number> = {
      [Hotkey_Names.terminalQuick1]: 0,
      [Hotkey_Names.terminalQuick2]: 1,
      [Hotkey_Names.terminalQuick3]: 2,
      [Hotkey_Names.terminalQuick4]: 3,
      [Hotkey_Names.terminalQuick5]: 4,
      [Hotkey_Names.terminalQuick6]: 5,
    };

    Object.entries(hotkeyToIndex).forEach(([name, index]) => {
      const quick = quickCommands[index];
      if (!quick) return;

      const baseTitle = Hotkey_Titles[name as keyof typeof Hotkey_Titles];
      const hasLabel = quick.label && quick.label.trim().length > 0;
      const hasCommand = quick.command && quick.command.trim().length > 0;

      if (!hasLabel && !hasCommand) return;

      if (hasLabel) {
        labels[name] = `${baseTitle} (${quick.label})`;
      } else if (hasCommand) {
        const preview = quick.command.length > 24 ? `${quick.command.slice(0, 24)}…` : quick.command;
        labels[name] = `${baseTitle} (${preview})`;
      }
    });

    return labels;
  }, [quickCommands]);

  const handleRecordClick = useCallback((name: string) => {
    setRecordingName(name);
    inputRefs.current[name]?.focus();
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>, name: string) => {
    event.preventDefault();

    const {key, ctrlKey, shiftKey, altKey, metaKey} = event;
    const lowerCaseKey = key.toLowerCase();

    if (lowerCaseKey === 'escape') {
      setRecordingName(null);
      inputRefs.current[name]?.blur();
      return;
    }

    if (isModifierKey(lowerCaseKey)) {
      if (inputRefs.current[name]) {
        // It's just a modifier
      }
      return;
    }

    const newHotkey: HotkeyLike = {
      key: lowerCaseKey,
      control: ctrlKey,
      shift: shiftKey,
      alt: altKey,
      meta: metaKey,
    };

    const result: LynxHotkey[] = hotkeys.map(item => {
      if (item.name !== name) return item;

      return {
        name: item.name,
        key: newHotkey.key || '',
        control: !!newHotkey.control,
        shift: !!newHotkey.shift,
        alt: !!newHotkey.alt,
        meta: !!newHotkey.meta,
      };
    });

    dispatch(hotkeysActions.setHotkeys(result));
    rendererIpc.storage.update('app', {hotkeys: result});

    setRecordingName(null);
    inputRefs.current[name]?.blur();
  }, []);

  const handleBlur = useCallback((name: string) => {
    setTimeout(() => {
      if (recordingName === name) {
        setRecordingName(null);
      }
    }, 100);
  }, []);

  const resetToDefault = useCallback(() => {
    const result = Get_Default_Hotkeys(window.osPlatform);
    dispatch(hotkeysActions.setHotkeys(result));
    rendererIpc.storage.update('app', {hotkeys: result});
  }, []);

  const renderItems = useCallback(
    (include: string[]) => {
      const config = hotkeys.map(hot => {
        const {name, ...hotkey} = hot;
        const baseLabel = Hotkey_Titles[name];
        const dynamicLabel = quickCommandLabelMap[name];

        return {
          hotkey,
          name,
          description: Hotkey_Desc[name],
          label: dynamicLabel || baseLabel,
        };
      });

      return compact(
        config.map(item => {
          const {label, hotkey, description, name} = item;
          const isRecording = recordingName === name;
          const canShow = canSettingItemShow(searchValue, [label, description, formatHotkey(hotkey)]);

          if (!canShow || !include.includes(name)) return null;

          return (
            <ListboxItem
              classNames={{
                description: 'transition-colors duration-200',
                title: 'transition-colors duration-200',
              }}
              endContent={
                <div className="flex flex-row gap-x-2 items-center">
                  <Button
                    size="sm"
                    variant="flat"
                    color="secondary"
                    disabled={isRecording}
                    isLoading={isRecording}
                    onPress={() => handleRecordClick(name)}>
                    <Keyboard_Icon className="size-4" />
                  </Button>
                  <Input
                    ref={el => {
                      inputRefs.current[name] = el;
                    }}
                    size="sm"
                    onBlur={() => handleBlur(name)}
                    variant={isRecording ? 'bordered' : 'flat'}
                    color={isRecording ? 'secondary' : 'default'}
                    value={isRecording ? 'Press keys...' : formatHotkey(hotkey)}
                    onKeyDown={isRecording ? e => handleKeyDown(e, name) : undefined}
                    placeholder={isRecording ? 'Press keys...' : formatHotkey(hotkey)}
                    classNames={{input: 'cursor-default', innerWrapper: 'cursor-default'}}
                    isReadOnly
                  />
                </div>
              }
              key={`${name}_hotkey`}
              title={<SettingsSearchHighlight text={label} />}
              description={<SettingsSearchHighlight text={description} />}
              className="transition-background duration-200 cursor-default"
            />
          );
        }),
      );
    },
    [hotkeys, quickCommandLabelMap, recordingName],
  );

  return (
    <SettingsSection title="Hotkeys" id={SettingsHotkeysId} icon={<Keyboard_Icon className="size-5" />}>
      <Listbox variant="flat">
        {Hotkey_Sections.map(section => {
          return (
            <ListboxSection key={section.kind} title={section.title}>
              {renderItems(section.includes)}
            </ListboxSection>
          );
        })}
      </Listbox>
      <Button onPress={resetToDefault} startContent={<RefreshDuo_Icon />}>
        Reset to Defaults
      </Button>
    </SettingsSection>
  );
};
