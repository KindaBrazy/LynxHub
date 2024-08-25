import {Button} from '@nextui-org/react';
import {message, Popconfirm} from 'antd';
import {useCallback} from 'react';

import rendererIpc from '../../../../../RendererIpc';
import SettingsSection from '../SettingsPage-ContentSection';

export const SettingsClearId = 'settings_rmv_data_elem';

/** Clear app settings and cache */
export default function SettingsClear() {
  const clearAppSettings = useCallback(() => {
    rendererIpc.storage.clear();
  }, []);

  const clearCache = useCallback(() => {
    localStorage.clear();
    message.success(`Cache cleared successfully.`);
  }, []);

  return (
    <SettingsSection icon="Trash" title="Clear" id={SettingsClearId} itemsCenter>
      <Popconfirm
        okText="Clear"
        okType="danger"
        title="Clear Settings"
        onConfirm={clearAppSettings}
        description="Are you sure you want to clear all app settings and restart?">
        <Button radius="sm" color="danger" variant="faded" className="cursor-default">
          Clear Settings (Restart)
        </Button>
      </Popconfirm>
      <Popconfirm
        okText="Clear"
        okType="danger"
        title="Clear Cache"
        onConfirm={clearCache}
        description="Are you sure you want to clear all cache?">
        <Button radius="sm" color="danger" variant="faded" className="cursor-default">
          Clear Cache
        </Button>
      </Popconfirm>
      <span>Please note that some data may need to be redownloaded or reconfigured after clearing.</span>
    </SettingsSection>
  );
}
