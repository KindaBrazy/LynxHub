import {List, Typography} from 'antd';
import {toUpper} from 'lodash';
import {useCallback, useState} from 'react';
import {useHotkeys, useRecordHotkeys} from 'react-hotkeys-hook';
import {useDispatch} from 'react-redux';

import {LynxHotkeys} from '../../../../../../../../cross/IpcChannelAndTypes';
import {settingsActions, useSettingsState} from '../../../../../Redux/App/SettingsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';
import LynxSwitch from '../../../../Reusable/LynxSwitch';
import SettingsSection from '../SettingsPage-ContentSection';

export const SettingsHotkeysId = 'settings_hotkeys_elem';

/** Managing application hotkeys */
export default function SettingsHotkeys() {
  const hotkeys = useSettingsState('hotkeys');
  const [keys, {start, stop, isRecording}] = useRecordHotkeys();
  const [recordingFor, setRecordingFor] = useState<keyof LynxHotkeys | undefined>(undefined);

  const dispatch = useDispatch<AppDispatch>();

  const onStop = useCallback(() => {
    stop();
    setRecordingFor(undefined);
  }, [stop]);

  const updateHotkeys = useCallback(
    (newHotkeys: Partial<LynxHotkeys>) => {
      const updatedHotkeys = {...hotkeys, ...newHotkeys};
      rendererIpc.storage.update('app', {hotkeys: updatedHotkeys});
      dispatch(settingsActions.setHotkeys(updatedHotkeys));
    },
    [hotkeys, dispatch],
  );

  const onEnableChange = useCallback(
    (isEnabled: boolean) => {
      updateHotkeys({isEnabled});
    },
    [updateHotkeys],
  );

  const handleHotkeyRecord = useCallback(
    (hotkeyType: keyof LynxHotkeys) => {
      setRecordingFor(hotkeyType);
      isRecording ? onStop() : start();
    },
    [isRecording, onStop, start],
  );

  useHotkeys('escape', onStop, {enabled: isRecording});

  useHotkeys(
    'enter',
    () => {
      if (isRecording && recordingFor) {
        const newHotkey = Array.from(keys)
          .filter(hotkey => hotkey !== 'enter')
          .join('+');
        console.log(newHotkey);
        updateHotkeys({[recordingFor]: newHotkey});
        onStop();
      }
    },
    {enabled: isRecording},
  );

  useHotkeys(
    'backspace',
    () => {
      stop();
      start();
    },
    {enabled: isRecording, preventDefault: true},
  );

  const renderHotkeyItem = useCallback(
    (title: string, description: string, hotkeyType: keyof LynxHotkeys) => (
      <List.Item
        extra={
          <Typography.Text keyboard>
            {recordingFor === hotkeyType
              ? toUpper(Array.from(keys).join(' + ')) || '...'
              : toUpper((hotkeys[hotkeyType] as string).replace(/\+/g, ' + '))}
          </Typography.Text>
        }
        onClick={() => handleHotkeyRecord(hotkeyType)}
        className="transition-colors duration-300 hover:bg-black/20">
        <List.Item.Meta title={title} description={description} />
      </List.Item>
    ),
    [handleHotkeyRecord, hotkeys, keys, recordingFor],
  );

  return (
    <SettingsSection icon="Keyboard" title="Hotkeys" id={SettingsHotkeysId}>
      <LynxSwitch
        title="Enable Hotkeys"
        enabled={hotkeys.isEnabled}
        onEnabledChange={onEnableChange}
        description="Enable or disable app hotkeys"
      />
      <List header="Global" className="overflow-hidden" bordered>
        {renderHotkeyItem('Toggle Navigation Bar', 'Press to show or hide navigation bar', 'TOGGLE_NAV')}
        {renderHotkeyItem(
          'Toggle Fullscreen',
          'Press to switch the app between fullscreen and windowed mode',
          'FULLSCREEN',
        )}
        {renderHotkeyItem('Switch AI View', 'Press to switch between terminal and browser views', 'TOGGLE_AI_VIEW')}
      </List>

      <List
        header={
          <div className="flex w-full justify-between">
            <span>Terminal</span>
            <span className="text-foreground-500">Not Configurable</span>
          </div>
        }
        className="overflow-hidden"
        bordered>
        <List.Item extra={<Typography.Text keyboard>{toUpper('Ctrl + Insert')}</Typography.Text>}>
          <List.Item.Meta
            title="Copy Terminal Selection"
            description="Press to copy the selected text in the terminal to the clipboard"
          />
        </List.Item>
        <List.Item extra={<Typography.Text keyboard>{toUpper('Shift + Insert')}</Typography.Text>}>
          <List.Item.Meta title="Paste To Terminal" description="Press to paste clipboard text into the terminal" />
        </List.Item>
      </List>

      {isRecording && (
        <>
          <Typography.Text type="success" className="text-center">
            Press <Typography.Text keyboard>Enter</Typography.Text> to save
          </Typography.Text>
          <Typography.Text type="danger" className="text-center">
            Press <Typography.Text keyboard>Backspace</Typography.Text> to clear
          </Typography.Text>
        </>
      )}

      <Typography.Text className="text-center" type={isRecording ? 'danger' : 'success'}>
        {isRecording ? (
          <span>
            Press <Typography.Text keyboard>Esc</Typography.Text> or click on item to cancel recording
          </span>
        ) : (
          'Click on item to record custom hotkey'
        )}
      </Typography.Text>
      <Typography.Text type="warning" className="text-center">
        Currently Hotkeys do not work when focused on the AI view (Browser)
      </Typography.Text>
    </SettingsSection>
  );
}
