import {Button, Card, Chip, Description, Key, Label, ListBox, Select} from '@heroui/react';
import SettingsSection from '@lynx/components/SettingsSection';
import {modalActions} from '@lynx/redux/reducers/modals';
import {useSettingsState} from '@lynx/redux/reducers/settings';
import {useUserState} from '@lynx/redux/reducers/user';
import {AppDispatch} from '@lynx/redux/store';
import {SubscribeStages} from '@lynx_common/types';
import applicationIpc from '@lynx_shared/ipc/application';
import pluginsIpc from '@lynx_shared/ipc/plugins';
import staticsIpc from '@lynx_shared/ipc/statics';
import userIpc from '@lynx_shared/ipc/user';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {Download} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import SettingsSearchHighlight from '../../settings/SettingsSearchHighlight';

export const DashboardUpdateId = 'settings_update_elem';

type UpdateStatus = {version: string; build: number; date: string};

const DashboardUpdate = memo(() => {
  const patreonLoggedIn = useUserState('patreonLoggedIn');
  const patreonUserData = useUserState('patreonUserData');

  const appUpdateAvailable = useSettingsState('updateAvailable');
  const [statusPublic, setStatusPublic] = useState<UpdateStatus>({version: '?', build: 0, date: '?'});
  const [statusEarly, setStatusEarly] = useState<UpdateStatus>({version: '?', build: 0, date: '?'});
  const [statusInsider, setStatusInsider] = useState<UpdateStatus>({version: '?', build: 0, date: '?'});

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    let mounted = true;
    async function fetchStatus() {
      const data = await staticsIpc.getReleases();
      const insider = await staticsIpc.getInsider();

      if (!mounted) return;

      if (data) {
        setStatusPublic({version: data.currentVersion, build: data.currentBuild, date: data.releaseDate});
        if (data.earlyAccess) {
          setStatusEarly({
            version: data.earlyAccess.version,
            build: data.earlyAccess.build,
            date: data.earlyAccess.releaseDate,
          });
        }
      }

      if (insider) {
        setStatusInsider({version: insider.currentVersion, build: insider.currentBuild, date: insider.releaseDate});
      }
    }

    fetchStatus();
    return () => {
      mounted = false;
    };
  }, []);

  const openUpdate = useCallback(() => {
    dispatch(modalActions.openUpdateApp({manual: true}));
  }, [dispatch]);

  const [selection, setSelection] = useState<string>('public');

  const onChange = useCallback((key: Key | null) => {
    if (!key || typeof key === 'number') return;

    AddBreadcrumb_Renderer(`Update Channel Changed: keys:${JSON.stringify(key)}`);

    const value = key as SubscribeStages;
    userIpc.patreon.updateChannel(value);
    pluginsIpc.checkForSync(value);
  }, []);

  useEffect(() => {
    const offChannel = applicationIpc.on.updateChannelChange(channel => {
      setSelection(channel);
    });
    userIpc.patreon.updateChannel('get');

    return () => {
      offChannel();
    };
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
  }, [patreonUserData.subscribeStage]);

  return (
    <SettingsSection title="Updates" id={DashboardUpdateId} icon={<Download className="size-5" />} itemsCenter>
      <Select value={selection} onChange={onChange} disabledKeys={disabledKeys}>
        <Label>
          <SettingsSearchHighlight text="Update Frequency" />
        </Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Description>
          <SettingsSearchHighlight text="Choose how often you want to receive updates." />
        </Description>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id="public" textValue="Standard Updates">
              <ListBox.ItemIndicator />
              <div className="flex flex-col">
                <Label>Standard Updates</Label>
                <Description>Get updates at the same time as everyone else.</Description>
              </div>
            </ListBox.Item>
            <ListBox.Item id="early_access" textValue="Early Access">
              <ListBox.ItemIndicator />
              <div className="flex flex-col">
                <Label>
                  <span>Early Access</span>
                  {patreonLoggedIn ? (
                    <span className="text-warning">
                      {patreonUserData.subscribeStage === 'public' && ' (Upgrade your Patreon tier to unlock)'}
                    </span>
                  ) : (
                    <span className="text-warning">(Login to Patreon to unlock)</span>
                  )}
                </Label>
                <Description>Get exclusive early access to updates and new features.</Description>
              </div>
            </ListBox.Item>
            <ListBox.Item id="insider" textValue="Insider">
              <ListBox.ItemIndicator />
              <div className="flex flex-col">
                <Label>
                  <span>Insider</span>
                  {patreonLoggedIn ? (
                    <span className="text-warning">
                      {patreonUserData.subscribeStage !== 'insider' && ' (Upgrade your Patreon tier to unlock)'}
                    </span>
                  ) : (
                    <span className="text-warning">(Login to Patreon to unlock)</span>
                  )}
                </Label>
                <Description>
                  Get immediate access to every new feature and fix for LynxHub Core, extensions and modules.
                </Description>
              </div>
            </ListBox.Item>
          </ListBox>
        </Select.Popover>
      </Select>

      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Insider Card */}
          <Card className={`${selection === 'insider' && 'border-2'} border-LynxPurple/50`}>
            <Card.Header>
              <div className="flex justify-between items-center">
                <h3 className="text-LynxPurple">Insider</h3>
                <Chip size="sm" color="accent">
                  Latest
                </Chip>
              </div>
            </Card.Header>

            <Card.Content>
              <div className="flex flex-col gap-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Version:</span>
                  <span>{statusInsider.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Build:</span>
                  <span>{statusInsider.build}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Date:</span>
                  <span>{statusInsider.date}</span>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Early Access Card */}
          <Card className={`${selection === 'early_access' && 'border-2'} border-warning/50`}>
            <Card.Header>
              <div className="flex justify-between items-center">
                <h3 className="text-warning">Early Access</h3>
                <Chip size="sm" color="warning">
                  Preview
                </Chip>
              </div>
            </Card.Header>

            <Card.Content>
              <div className="flex flex-col gap-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Version:</span>
                  <span>{statusEarly.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Build:</span>
                  <span>{statusEarly.build}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Date:</span>
                  <span>{statusEarly.date}</span>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Public Card */}
          <Card className={`${selection === 'public' && 'border-2'} border-success/50`}>
            <Card.Header>
              <h3 className="text-success">Public</h3>
            </Card.Header>

            <Card.Content>
              <div className="flex flex-col gap-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Version:</span>
                  <span>{statusPublic.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Build:</span>
                  <span>{statusPublic.build}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Date:</span>
                  <span>{statusPublic.date}</span>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

        {appUpdateAvailable && (
          <Button className="mt-4" onPress={openUpdate} fullWidth>
            Update
          </Button>
        )}
      </div>
    </SettingsSection>
  );
});

DashboardUpdate.displayName = 'DashboardUpdate';

export default DashboardUpdate;
