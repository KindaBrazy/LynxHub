import {Button, Select, Selection, SelectItem} from '@nextui-org/react';
import {Descriptions, Divider, Space} from 'antd';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {WIN_RELEASE_URL} from '../../../../../../../../cross/CrossConstants';
import {AppUpdateData} from '../../../../../../../../cross/CrossTypes';
import {Download2_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons1';
import {modalActions} from '../../../../../Redux/AI/ModalsReducer';
import {useSettingsState} from '../../../../../Redux/App/SettingsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import {useUserState} from '../../../../../Redux/User/UserReducer';
import SettingsSection from '../../Settings/SettingsPage-ContentSection';

export const DashboardUpdateId = 'settings_update_elem';

type UpdateStatus = {version: string; build: number; date: string};

export default function DashboardUpdate() {
  const patreonLoggedIn = useUserState('patreonLoggedIn');
  const patreonUserData = useUserState('patreonUserData');

  const appUpdateAvailable = useSettingsState('updateAvailable');
  const [statusPublic, setStatusPublic] = useState<UpdateStatus>({version: '?', build: 0, date: '?'});
  const [statusEarly, setStatusEarly] = useState<UpdateStatus>({version: '?', build: 0, date: '?'});

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    async function fetchStatus() {
      const response = await fetch(WIN_RELEASE_URL);
      const data = (await response.json()) as AppUpdateData;
      setStatusPublic({version: data.currentVersion, build: data.currentBuild, date: data.releaseDate});
      if (data.earlyAccess) {
        setStatusEarly({
          version: data.earlyAccess.version,
          build: data.earlyAccess.build,
          date: data.earlyAccess.releaseDate,
        });
      }
    }

    fetchStatus();
  }, []);

  const openUpdate = useCallback(() => {
    dispatch(modalActions.openModal('updateApp'));
  }, [dispatch]);

  const [selection, setSelection] = useState<string[]>(['public']);

  const onChange = useCallback((keys: Selection) => {
    if (keys !== 'all') {
      const value = keys.values().next().value?.toString();
      if (value) {
        window.electron.ipcRenderer.send('patreon-change-update-channel', value);
      }
    }
  }, []);

  useEffect(() => {
    window.electron.ipcRenderer.removeAllListeners('updateChannel-change');
    window.electron.ipcRenderer.on('updateChannel-change', (_, result) => {
      setSelection([result]);
    });
    window.electron.ipcRenderer.send('patreon-change-update-channel', 'get');
  }, []);

  return (
    <SettingsSection title="Updates" id={DashboardUpdateId} icon={<Download2_Icon className="size-5" />} itemsCenter>
      <Select
        radius="sm"
        label="Update Frequency"
        labelPlacement="outside"
        selectedKeys={selection}
        onSelectionChange={onChange}
        description="Choose how often you want to receive updates."
        disabledKeys={patreonUserData.earlyAccess ? undefined : ['ea']}
        classNames={{trigger: 'cursor-default !transition !duration-300', description: 'text-start'}}
        disallowEmptySelection>
        <SelectItem
          key="public"
          className="cursor-default"
          description="Get updates at the same time as everyone else.">
          Standard Updates
        </SelectItem>
        <SelectItem
          key="ea"
          textValue="Early Access"
          className="cursor-default"
          classNames={{title: 'space-x-1'}}
          description="Get exclusive early access to updates and new features.">
          <span>Early Access</span>
          {patreonLoggedIn ? (
            <span className="text-warning">
              {!patreonUserData.earlyAccess && '(Upgrade your Patreon tier to unlock)'}
            </span>
          ) : (
            <span className="text-warning">(Log in to Patreon to unlock)</span>
          )}
        </SelectItem>
      </Select>

      {appUpdateAvailable && (
        <Button radius="sm" color="success" className="mt-6" onPress={openUpdate} fullWidth>
          Update
        </Button>
      )}

      <div className="text-start">
        <Divider dashed>Status</Divider>
        <Space direction="vertical" split={<Divider dashed />}>
          <div>
            <Descriptions title="Public">
              <Descriptions.Item label="Version: ">{statusPublic.version}</Descriptions.Item>
              <Descriptions.Item label="Build: ">{statusPublic.build}</Descriptions.Item>
              <Descriptions.Item label="Date: ">{statusPublic.date}</Descriptions.Item>
            </Descriptions>
          </div>

          <div>
            <Descriptions title="Early Access">
              <Descriptions.Item label="Version: ">{statusEarly.version}</Descriptions.Item>
              <Descriptions.Item label="Build: ">{statusEarly.build || '?'}</Descriptions.Item>
              <Descriptions.Item label="Date: ">{statusEarly.date}</Descriptions.Item>
            </Descriptions>
          </div>
        </Space>
      </div>
    </SettingsSection>
  );
}
