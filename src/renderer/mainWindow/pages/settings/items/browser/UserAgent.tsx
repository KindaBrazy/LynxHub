import {Button, Input, Select, Selection, SelectItem} from '@heroui/react';
import {AppDispatch} from '@lynx/redux/store';
import {lynxTopToast} from '@lynx/utils/hooks';
import {AgentTypes} from '@lynx_common/types/ipc';
import browserIpc from '@lynx_shared/ipc/browser';
import storageIpc from '@lynx_shared/ipc/storage';
import {Diskette} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import SettingsFilterItem from '../../SettingsFilterItem';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';

export default function UserAgent() {
  const [selectedAgent, setSelectedAgent] = useState<AgentTypes | undefined>('lynxhub');
  const [customValue, setCustomValue] = useState<string>('');

  const [desc, setDesc] = useState<{id: string; value: string}[]>([]);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const agents = async () => {
      const {userAgent} = await storageIpc.get('browser');
      setSelectedAgent(userAgent);

      if (userAgent === 'custom') {
        storageIpc.get('browser').then(result => {
          setCustomValue(result.customUserAgent);
        });
      }

      const lynxhubValue = await browserIpc.invoke.getUserAgent('lynxhub');
      const electronValue = await browserIpc.invoke.getUserAgent('electron');
      const chromeValue = await browserIpc.invoke.getUserAgent('chrome');
      const customValue = await browserIpc.invoke.getUserAgent('custom');

      setDesc([
        {id: 'lynxhub', value: lynxhubValue},
        {id: 'electron', value: electronValue},
        {id: 'chrome', value: chromeValue},
        {id: 'custom', value: customValue},
      ]);
    };

    agents();
  }, []);

  const onSelectionChange = useCallback((keys: Selection) => {
    if (keys !== 'all') {
      const value = keys.values().next().value?.toString() as AgentTypes;
      setSelectedAgent(value);
      if (value === 'custom') {
        storageIpc.get('browser').then(result => {
          setCustomValue(result.customUserAgent);
        });
      }
      storageIpc.update('browser', {userAgent: value});
      browserIpc.send.updateUserAgent();
    }
  }, []);

  const saveCustom = () => {
    storageIpc.update('browser', {customUserAgent: customValue, userAgent: 'custom'});
    lynxTopToast(dispatch).success('Custom user agent saved successfully!');
  };

  return (
    <SettingsFilterItem
      searchTexts={['User Agent', 'browser', 'user agent', 'lynxhub', 'electron', 'chrome', 'custom', 'ua']}>
      <div className="flex flex-col gap-y-2">
        <Select
          onSelectionChange={onSelectionChange}
          selectedKeys={selectedAgent ? [selectedAgent] : []}
          label={<SettingsSearchHighlight text="User Agent" />}>
          <SelectItem
            key="lynxhub"
            variant="flat"
            color="success"
            description={desc.find(d => d.id === 'lynxhub')?.value || undefined}>
            LynxHub (Default)
          </SelectItem>
          <SelectItem
            key="electron"
            variant="flat"
            description={desc.find(d => d.id === 'electron')?.value || undefined}>
            Electron
          </SelectItem>
          <SelectItem key="chrome" variant="flat" description={desc.find(d => d.id === 'chrome')?.value || undefined}>
            Chrome
          </SelectItem>
          <SelectItem key="custom" variant="flat" description={desc.find(d => d.id === 'custom')?.value || undefined}>
            Custom
          </SelectItem>
        </Select>
        {selectedAgent === 'custom' && (
          <div className="flex gap-x-2 flex-row w-full items-center">
            <Input value={customValue} onValueChange={setCustomValue} />
            <Button variant="flat" color="success" onPress={saveCustom} isIconOnly>
              <Diskette />
            </Button>
          </div>
        )}
      </div>
    </SettingsFilterItem>
  );
}
