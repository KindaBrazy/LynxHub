import {Description, Key, Label, ListBox, Select} from '@heroui/react';
import {CustomRunBehaviorData} from '@lynx_common/types/ipc';
import {Fragment, useCallback} from 'react';

import {useCustomRunBehavior} from '../hooks/useCustomRunBehavior';
import LaunchConfigSection from '../LaunchConfigSection';
import {UrlCatch} from './UrlCatch';

type TerminalType = CustomRunBehaviorData['terminal'];
type BrowserType = CustomRunBehaviorData['browser'];

type Props = {id: string};
export default function Behavior({id}: Props) {
  const {behavior, updateBehavior} = useCustomRunBehavior(id);
  const {terminal = 'runScript', browser = 'appBrowser', urlCatch} = behavior;

  const onTerminalChange = useCallback(
    (key: Key | null) => {
      if (!key || typeof key === 'number') return;
      const result = key as TerminalType;
      updateBehavior({terminal: result});
    },
    [updateBehavior],
  );

  const onBrowserChange = useCallback(
    (key: Key | null) => {
      if (!key || typeof key === 'number') return;
      const result = key as BrowserType;
      updateBehavior({browser: result});
    },
    [updateBehavior],
  );

  const onUrlCatchUpdate = useCallback(
    (newUrlCatch: CustomRunBehaviorData['urlCatch']) => {
      updateBehavior({urlCatch: newUrlCatch});
    },
    [updateBehavior],
  );

  return (
    <LaunchConfigSection
      title="Launch Behavior"
      customButton={<Fragment />}
      description="Configure custom startup commands and manage terminal, browser, and URL detection behaviors">
      <div className="flex flex-col gap-y-4">
        <Select value={terminal} onChange={onTerminalChange} fullWidth>
          <Label>Terminal</Label>
          <Select.Trigger>
            <Select.Value>
              {({selectedText}) => {
                return <span>{selectedText}</span>;
              }}
            </Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="runScript" textValue="Run Script">
                <div className="flex flex-col">
                  <Label>Run Script</Label>
                  <Description>Execute the designated script (e.g., webui.bat).</Description>
                </div>
              </ListBox.Item>
              <ListBox.Item id="empty" textValue="Open Empty Terminal">
                <div className="flex flex-col">
                  <Label>Open Empty Terminal</Label>
                  <Description>Open an empty terminal without executing any commands.</Description>
                </div>
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
          <Description>Configure how the terminal behaves when launching the AI.</Description>
        </Select>

        <Select value={browser} onChange={onBrowserChange} fullWidth>
          <Label>Browser</Label>
          <Select.Trigger>
            <Select.Value>
              {({selectedText}) => {
                return <span>{selectedText}</span>;
              }}
            </Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="appBrowser" textValue="In-App Browser">
                <div className="flex flex-col">
                  <Label>In-App Browser</Label>
                  <Description>Execute the designated script (e.g., webui.bat).</Description>
                </div>
              </ListBox.Item>
              <ListBox.Item id="defaultBrowser" textValue="Default Browser">
                <div className="flex flex-col">
                  <Label>Default Browser</Label>
                  <Description>Open the address in your system default browser.</Description>
                </div>
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
          <Description>Define what happens when the application detects an address to launch.</Description>
        </Select>
      </div>

      <UrlCatch value={urlCatch} onUpdate={onUrlCatchUpdate} />
    </LaunchConfigSection>
  );
}
