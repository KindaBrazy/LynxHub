import {Button, Card, Chip, Select, Selection, SelectItem} from '@heroui/react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {SubscribeStages} from '../../../../../../../../cross/CrossTypes';
import AddBreadcrumb_Renderer from '../../../../../../../Breadcrumbs';
import {Download2_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {modalActions} from '../../../../../Redux/Reducer/ModalsReducer';
import {useSettingsState} from '../../../../../Redux/Reducer/SettingsReducer';
import {useUserState} from '../../../../../Redux/Reducer/UserReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';
import SettingsSection from '../../Settings/SettingsPage-ContentSection';

export const DashboardUpdateId = 'settings_update_elem';

type UpdateStatus = {version: string; build: number; date: string};

export default function DashboardUpdate() {
  const patreonLoggedIn = useUserState('patreonLoggedIn');
  const patreonUserData = useUserState('patreonUserData');

  const appUpdateAvailable = useSettingsState('updateAvailable');
  const [statusPublic, setStatusPublic] = useState<UpdateStatus>({version: '?', build: 0, date: '?'});
  const [statusEarly, setStatusEarly] = useState<UpdateStatus>({version: '?', build: 0, date: '?'});
  const [statusInsider, setStatusInsider] = useState<UpdateStatus>({version: '?', build: 0, date: '?'});

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    async function fetchStatus() {
      const data = await rendererIpc.statics.getReleases();
      const insider = await rendererIpc.statics.getInsider();
      setStatusPublic({version: data.currentVersion, build: data.currentBuild, date: data.releaseDate});
      if (data.earlyAccess) {
        setStatusEarly({
          version: data.earlyAccess.version,
          build: data.earlyAccess.build,
          date: data.earlyAccess.releaseDate,
        });
      }

      setStatusInsider({version: insider.currentVersion, build: insider.currentBuild, date: insider.releaseDate});
    }

    fetchStatus();
  }, []);

  const openUpdate = useCallback(() => {
    dispatch(modalActions.openUpdateApp());
  }, [dispatch]);

  const [selection, setSelection] = useState<string[]>(['public']);

  const onChange = useCallback((keys: Selection) => {
    AddBreadcrumb_Renderer(`Update Channel Changed: keys:${JSON.stringify(keys)}`);
    if (keys !== 'all') {
      const value = keys.values().next().value?.toString() as SubscribeStages | undefined;
      if (value) {
        rendererIpc.patreon.updateChannel(value);
        rendererIpc.plugins.checkForSync(value);
      }
    }
  }, []);

  useEffect(() => {
    window.electron.ipcRenderer.removeAllListeners('updateChannel-change');
    window.electron.ipcRenderer.on('updateChannel-change', (_, result) => {
      setSelection([result]);
    });
    rendererIpc.patreon.updateChannel('get');
  }, []);

  const disabledKeys = useMemo(() => {
    switch (patreonUserData.subscribeStage) {
      case 'insider':
        return [];
      case 'early_access':
        return ['early_access'];
      case 'public':
        return ['early_access', 'insider'];
    }
  }, [patreonUserData]);

  return (
    <SettingsSection title="Updates" id={DashboardUpdateId} icon={<Download2_Icon className="size-5" />} itemsCenter>
      <Select
        radius="sm"
        label="Update Frequency"
        labelPlacement="outside"
        selectedKeys={selection}
        disabledKeys={disabledKeys}
        onSelectionChange={onChange}
        description="Choose how often you want to receive updates."
        classNames={{trigger: 'cursor-default !transition !duration-300', description: 'text-start'}}
        disallowEmptySelection>
        <SelectItem
          key="public"
          className="cursor-default"
          description="Get updates at the same time as everyone else.">
          Standard Updates
        </SelectItem>
        <SelectItem
          key="early_access"
          textValue="Early Access"
          className="cursor-default"
          classNames={{title: 'space-x-1'}}
          description="Get exclusive early access to updates and new features.">
          <span>Early Access</span>
          {patreonLoggedIn ? (
            <span className="text-warning">
              {patreonUserData.subscribeStage === 'public' && '(Upgrade your Patreon tier to unlock)'}
            </span>
          ) : (
            <span className="text-warning">(Login to Patreon to unlock)</span>
          )}
        </SelectItem>
        <SelectItem
          key="insider"
          textValue="Insider"
          className="cursor-default"
          classNames={{title: 'space-x-1'}}
          description="Get immediate access to every new feature and fix for LynxHub Core, extensions and modules.">
          <span>Insider</span>
          {patreonLoggedIn ? (
            <span className="text-warning">
              {patreonUserData.subscribeStage !== 'insider' && '(Upgrade your Patreon tier to unlock)'}
            </span>
          ) : (
            <span className="text-warning">(Login to Patreon to unlock)</span>
          )}
        </SelectItem>
      </Select>

      {appUpdateAvailable && (
        <Button color="success" className="mt-6" onPress={openUpdate} fullWidth>
          Update
        </Button>
      )}

      <div className="w-full mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Insider Card */}
          <Card
            className={
              `p-4 bg-content2 shadow cursor-default ` +
              `${selection[0] === 'insider' && 'border-2'} border-secondary/50`
            }
            isPressable>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-secondary">Insider</h3>
              <Chip size="sm" variant="flat" color="secondary">
                Latest
              </Chip>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-default-500">Version:</span>
                <span className="font-medium">{statusInsider.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-default-500">Build:</span>
                <span className="font-medium">{statusInsider.build}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-default-500">Date:</span>
                <span className="font-medium">{statusInsider.date}</span>
              </div>
            </div>
          </Card>

          {/* Early Access Card */}
          <Card
            className={
              `p-4 bg-content2 shadow cursor-default ` +
              `${selection[0] === 'early_access' && 'border-2'} border-warning/50`
            }
            isPressable>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-warning">Early Access</h3>
              <Chip size="sm" variant="flat" color="warning">
                Preview
              </Chip>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-default-500">Version:</span>
                <span className="font-medium">{statusEarly.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-default-500">Build:</span>
                <span className="font-medium">{statusEarly.build || '?'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-default-500">Date:</span>
                <span className="font-medium">{statusEarly.date}</span>
              </div>
            </div>
          </Card>

          {/* Public Card */}
          <Card
            className={
              `p-4 bg-content2 shadow cursor-default ` + `${selection[0] === 'public' && 'border-2'} border-success/50`
            }
            isPressable>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-success">Public</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-default-500">Version:</span>
                <span className="font-medium">{statusPublic.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-default-500">Build:</span>
                <span className="font-medium">{statusPublic.build}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-default-500">Date:</span>
                <span className="font-medium">{statusPublic.date}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </SettingsSection>
  );
}
