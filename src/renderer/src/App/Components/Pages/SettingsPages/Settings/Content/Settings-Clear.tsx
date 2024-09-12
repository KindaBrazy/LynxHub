import {Button} from '@mantine/core';
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
        <Button radius="md" variant="default" className="!cursor-default !transition !duration-300" fullWidth>
          <span className="text-danger">Clear Settings (Restart)</span>
        </Button>
      </Popconfirm>
      <Popconfirm
        okText="Clear"
        okType="danger"
        title="Clear Cache"
        onConfirm={clearCache}
        description="Are you sure you want to clear all cache?">
        <Button radius="md" variant="default" className="!cursor-default !transition !duration-300" fullWidth>
          <span className="text-warning">Clear Cache</span>
        </Button>
      </Popconfirm>
      <span>Please note that some data may need to be redownloaded or reconfigured after clearing.</span>
    </SettingsSection>
  );
}
