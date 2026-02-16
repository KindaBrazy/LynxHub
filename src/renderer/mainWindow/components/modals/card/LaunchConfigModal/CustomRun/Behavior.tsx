import {Select, Selection, SelectItem} from '@heroui/react';
import {CustomRunBehaviorData} from '@lynx_common/types/ipc';
import storageIpc, {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {isEmpty} from 'lodash';
import {Fragment, useEffect, useState} from 'react';

import LaunchConfigSection from '../Section';
import {UrlCatch} from './UrlCatch';

type TerminalType = CustomRunBehaviorData['terminal'];
type BrowserType = CustomRunBehaviorData['browser'];

type Props = {id: string};
export default function Behavior({id}: Props) {
  const [terminalValue, setTerminalValue] = useState<TerminalType>('runScript');
  const [browserValue, setBrowserValue] = useState<BrowserType>('appBrowser');

  const onTerminalChange = (value: Selection) => {
    if (value && value !== 'all') {
      const result = value.values().next().value as TerminalType;
      setTerminalValue(result);
      storageUtilsIpc.send.updateCustomRunBehavior({
        cardID: id,
        terminal: result,
      });
    }
  };

  const onBrowserChange = (value: Selection) => {
    if (value && value !== 'all') {
      const result = value.values().next().value as BrowserType;
      setBrowserValue(result);
      storageUtilsIpc.send.updateCustomRunBehavior({
        cardID: id,
        browser: result,
      });
    }
  };

  useEffect(() => {
    storageIpc.get('cardsConfig').then(result => {
      if (!isEmpty(result.customRunBehavior)) {
        const data = result.customRunBehavior.find(customRun => customRun.cardID === id);
        if (data) {
          setBrowserValue(data.browser);
          setTerminalValue(data.terminal);
        }
      }
    });
  }, [setTerminalValue, setBrowserValue, id]);

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
          selectedKeys={[terminalValue]}
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
          selectedKeys={[browserValue]}
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
        <UrlCatch id={id} />
      </div>
    </LaunchConfigSection>
  );
}
