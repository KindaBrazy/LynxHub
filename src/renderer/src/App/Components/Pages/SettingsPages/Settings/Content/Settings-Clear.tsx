import {Button} from '@heroui/react';
import {message, Popconfirm} from 'antd';
import {useCallback} from 'react';

import {Trash_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons3';
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
    <SettingsSection title="Clear" id={SettingsClearId} icon={<Trash_Icon className="size-5" />} itemsCenter>
      <Popconfirm
        okText="Clear"
        okType="danger"
        title="Clear Settings"
        onConfirm={clearAppSettings}
        description="Are you sure you want to clear all app settings and restart?">
        <Button variant="flat" color="danger" fullWidth>
          Clear Settings (Restart Required)
        </Button>
      </Popconfirm>
      <Popconfirm
        okText="Clear"
        okType="danger"
        title="Clear Cache"
        onConfirm={clearCache}
        description="Are you sure you want to clear all cache?">
        <Button variant="flat" color="warning" fullWidth>
          Clear Cache
        </Button>
      </Popconfirm>
      <span>Please note that some data may need to be redownloaded or reconfigured after clearing.</span>
    </SettingsSection>
  );
}
