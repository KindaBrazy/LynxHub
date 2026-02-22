import {Select, Selection, SelectItem} from '@heroui/react';
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
    (value: Selection) => {
      if (value && value !== 'all') {
        const result = value.values().next().value as TerminalType;
        updateBehavior({terminal: result});
      }
    },
    [updateBehavior],
  );

  const onBrowserChange = useCallback(
    (value: Selection) => {
      if (value && value !== 'all') {
        const result = value.values().next().value as BrowserType;
        updateBehavior({browser: result});
      }
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
      <div className="flex flex-col">
        <Select
          classNames={{
            trigger: 'bg-LynxWhiteThird dark:bg-LynxRaisinBlack',
          }}
          label="Terminal"
          selectionMode="single"
          labelPlacement="outside"
          selectedKeys={[terminal]}
          onSelectionChange={onTerminalChange}
          description="Configure how the terminal behaves when launching the AI."
          disallowEmptySelection>
          <SelectItem key="runScript" description="Execute the designated script (e.g., webui.bat).">
            Run Script
          </SelectItem>
          <SelectItem key="empty" description="Open an empty terminal without executing any commands.">
            Open Empty Terminal
          </SelectItem>
        </Select>
        <Select
          label="Browser"
          selectionMode="single"
          labelPlacement="outside"
          selectedKeys={[browser]}
          onSelectionChange={onBrowserChange}
          classNames={{trigger: 'bg-LynxWhiteThird dark:bg-LynxRaisinBlack'}}
          description="Define what happens when the application detects an address to launch."
          disallowEmptySelection>
          <SelectItem key="appBrowser" description="Open the address in the integrated in-app browser.">
            In-App Browser
          </SelectItem>
          <SelectItem key="defaultBrowser" description="Open the address in your system default browser.">
            Default Browser
          </SelectItem>
        </Select>
      </div>
      <div className="flex w-full flex-col items-center gap-y-2">
        <UrlCatch value={urlCatch} onUpdate={onUrlCatchUpdate} />
      </div>
    </LaunchConfigSection>
  );
}
