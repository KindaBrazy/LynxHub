import {Button, Input} from '@heroui/react';
import {List} from 'antd';
import {capitalize, compact} from 'lodash';
import {KeyboardEvent, useEffect, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {Get_Default_Hotkeys, Hotkey_Desc, Hotkey_Titles} from '../../../../../../../../cross/HotkeyConstants';
import {LynxHotkey} from '../../../../../../../../cross/IpcChannelAndTypes';
import {Keyboard_Icon, Refresh3_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons4';
import {hotkeysActions, useHotkeysState} from '../../../../../Redux/Reducer/HotkeysReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';
import SettingsSection from '../SettingsPage-ContentSection';

export const SettingsHotkeysId = 'settings_hotkeys_elem';

type Hotkey = {
  key: string;
  control: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
};

type HotkeyConfig = {name: string; label: string; description: string; hotkey: Hotkey | null}[];

const formatHotkey = (hotkey: Hotkey | null): string => {
  if (!hotkey || !hotkey.key) {
    return 'Not Set';
  }

  const parts: string[] = [];
  if (hotkey.control) parts.push('Ctrl');
  if (hotkey.alt) parts.push('Alt');
  if (hotkey.shift) parts.push('Shift');
  if (hotkey.meta) parts.push('Cmd/Super');

  let displayKey: string;
  switch (hotkey.key.toLowerCase()) {
    case 'arrowup':
      displayKey = 'Up';
      break;
    case 'arrowdown':
      displayKey = 'Down';
      break;
    case 'arrowleft':
      displayKey = 'Left';
      break;
    case 'arrowright':
      displayKey = 'Right';
      break;
    case ' ':
      displayKey = 'Space';
      break;
    case 'escape':
      displayKey = 'Esc';
      break;

    default:
      displayKey = capitalize(hotkey.key);
  }

  parts.push(displayKey);
  return parts.join(' + ');
};

const isModifierKey = (key: string): boolean => {
  return ['control', 'shift', 'alt', 'meta', 'os'].includes(key.toLowerCase());
};

export const HotkeySettings = () => {
  const hotkeys = useHotkeysState('hotkeys');
  const [config, setConfig] = useState<HotkeyConfig>([]);
  const [recordingName, setRecordingName] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    setConfig(
      hotkeys.map(hot => {
        const {name, ...hotkey} = hot;
        return {hotkey, name, description: Hotkey_Desc[name], label: Hotkey_Titles[name]};
      }),
    );
  }, [hotkeys]);

  const handleRecordClick = (name: string) => {
    setRecordingName(name);

    inputRefs.current[name]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, name: string) => {
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

    const newHotkey: Hotkey = {
      key: lowerCaseKey,
      control: ctrlKey,
      shift: shiftKey,
      alt: altKey,
      meta: metaKey,
    };

    const data = config.map(item => (item.name === name ? {...item, hotkey: newHotkey} : item));
    const result: LynxHotkey[] = compact(
      data.map(item => {
        if (!item.hotkey) return null;
        return {
          name: item.name,
          ...item.hotkey,
        };
      }),
    );
    dispatch(hotkeysActions.setHotkeys(result));
    rendererIpc.storage.update('app', {hotkeys: result});

    setRecordingName(null);
    inputRefs.current[name]?.blur();
  };

  const handleBlur = (name: string) => {
    setTimeout(() => {
      if (recordingName === name) {
        setRecordingName(null);
      }
    }, 100);
  };

  const resetToDefault = () => {
    const result = Get_Default_Hotkeys(window.osPlatform);
    dispatch(hotkeysActions.setHotkeys(result));
    rendererIpc.storage.update('app', {hotkeys: result});
  };

  return (
    <SettingsSection title="Hotkeys" id={SettingsHotkeysId} icon={<Keyboard_Icon className="size-5" />}>
      <List header="Global" className="w-full overflow-hidden" bordered>
        {config.map(item => {
          const {label, hotkey, description, name} = item;
          const isRecording = recordingName === name;

          return (
            <List.Item
              extra={
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
                    onBlur={() => handleBlur(name)}
                    variant={isRecording ? 'bordered' : 'flat'}
                    value={isRecording ? 'Press keys...' : formatHotkey(hotkey)}
                    onKeyDown={isRecording ? e => handleKeyDown(e, name) : undefined}
                    placeholder={isRecording ? 'Press keys...' : formatHotkey(hotkey)}
                    classNames={{input: 'cursor-default', innerWrapper: 'cursor-default'}}
                    readOnly
                  />
                </div>
              }
              title={label}
              key={`${name}_hotkey`}
              className="transition-colors duration-300 hover:bg-black/20">
              <List.Item.Meta title={label} description={description} />
            </List.Item>
          );
        })}
      </List>
      <Button onPress={resetToDefault} startContent={<Refresh3_Icon />}>
        Reset to Defaults
      </Button>
    </SettingsSection>
  );
};
