import {Button, Input, Select, Selection, SelectItem} from '@heroui/react';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {AgentTypes} from '../../../../../../../../../cross/IpcChannelAndTypes';
import {DiskDuo_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons';
import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';
import {lynxTopToast} from '../../../../../../Utils/UtilHooks';

export default function SettingsBrowser_UserAgent() {
  const [selectedAgent, setSelectedAgent] = useState<AgentTypes | undefined>('lynxhub');
  const [customValue, setCustomValue] = useState<string>('');

  const [desc, setDesc] = useState<{id: string; value: string}[]>([]);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const agents = async () => {
      const {userAgent} = await rendererIpc.storage.get('browser');
      setSelectedAgent(userAgent);

      if (userAgent === 'custom') {
        rendererIpc.storage.get('browser').then(result => {
          setCustomValue(result.customUserAgent);
        });
      }

      const lynxhubValue = await rendererIpc.browser.getUserAgent('lynxhub');
      const electronValue = await rendererIpc.browser.getUserAgent('electron');
      const chromeValue = await rendererIpc.browser.getUserAgent('chrome');
      const customValue = await rendererIpc.browser.getUserAgent('custom');

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
        rendererIpc.storage.get('browser').then(result => {
          setCustomValue(result.customUserAgent);
        });
      }
      rendererIpc.storage.update('browser', {userAgent: value});
      rendererIpc.browser.updateUserAgent();
    }
  }, []);

  const saveCustom = () => {
    rendererIpc.storage.update('browser', {customUserAgent: customValue, userAgent: 'custom'});
    lynxTopToast(dispatch).success('Custom user agent saved successfully!');
  };

  return (
    <div className="flex flex-col gap-y-2">
      <Select
        label="User Agent"
        onSelectionChange={onSelectionChange}
        selectedKeys={selectedAgent ? [selectedAgent] : []}>
        <SelectItem
          key="lynxhub"
          variant="flat"
          color="success"
          description={desc.find(d => d.id === 'lynxhub')?.value || undefined}>
          LynxHub (Default)
        </SelectItem>
        <SelectItem key="electron" variant="flat" description={desc.find(d => d.id === 'electron')?.value || undefined}>
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
            <DiskDuo_Icon />
          </Button>
        </div>
      )}
    </div>
  );
}
