import {Select, Selection, SelectItem} from '@heroui/react';
import {isEmpty} from 'lodash';
import {Fragment, useEffect, useState} from 'react';

import rendererIpc from '../../../../RendererIpc';
import LaunchConfigSection from '../LaunchConfig-Section';

type Props = {id: string};
export default function CustomRunBehavior({id}: Props) {
  const [terminalValue, setTerminalValue] = useState<string>('runScript');
  const [browserValue, setBrowserValue] = useState<string>('appBrowser');

  const onTerminalChange = (value: Selection) => {
    if (value && value !== 'all') {
      console.log(value);
      setTerminalValue(value.values().next().value as string);
      rendererIpc.storageUtils.updateCustomRunBehavior({
        cardID: id,
        terminal: value.values().next().value as string,
        browser: browserValue,
      });
    }
  };

  const onBrowserChange = (value: Selection) => {
    if (value && value !== 'all') {
      setBrowserValue(value.values().next().value as string);
      rendererIpc.storageUtils.updateCustomRunBehavior({
        cardID: id,
        terminal: terminalValue,
        browser: value.values().next().value as string,
      });
    }
  };

  useEffect(() => {
    rendererIpc.storage.get('cardsConfig').then(result => {
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
    <>
      <LaunchConfigSection title="Launch Behavior" customButton={<Fragment />}>
        <div className="space-y-4">
          <div className="flex w-full flex-row items-center space-x-2">
            <Select
              label="Terminal"
              selectionMode="single"
              labelPlacement="outside"
              selectedKeys={[terminalValue]}
              onSelectionChange={onTerminalChange}
              description="Configure how the terminal behaves when launching the AI."
              classNames={{trigger: 'transition duration-300 data-[hover=true]:bg-foreground-300 bg-foreground-200'}}
              disallowEmptySelection>
              <SelectItem key="runScript" description="Execute the designated script (e.g., webui.bat).">
                Run Script
              </SelectItem>
              <SelectItem key="empty" description="Open an empty terminal without executing any commands.">
                Open Empty Terminal
              </SelectItem>
            </Select>
          </div>
          <div className="flex w-full flex-row items-center space-x-2">
            <Select
              label="Browser"
              selectionMode="single"
              labelPlacement="outside"
              selectedKeys={[browserValue]}
              onSelectionChange={onBrowserChange}
              description="Define what happens when the application detects an address to launch."
              classNames={{trigger: 'transition duration-300 data-[hover=true]:bg-foreground-300 bg-foreground-200'}}
              disallowEmptySelection>
              <SelectItem
                key="appBrowser"
                description="Open the address in the integrated in-app browser (triggered from the terminal).">
                Use In-App Browser
              </SelectItem>
              <SelectItem
                key="defaultBrowser"
                description="Open the address in your default web browser (triggered from the terminal).">
                Use Default Browser
              </SelectItem>
              <SelectItem key="doNothing" description="Take no action.">
                Do Nothing
              </SelectItem>
            </Select>
          </div>
        </div>
      </LaunchConfigSection>
    </>
  );
}
