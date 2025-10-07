import {Button, Chip, User} from '@heroui/react';
import {useMemo} from 'react';

import {extractGitUrl} from '../../../../../../../../cross/CrossUtils';
import {InstalledPlugin} from '../../../../../../../../cross/plugin/PluginTypes';
import AddBreadcrumb_Renderer from '../../../../../../../Breadcrumbs';
import {ExternalDuo_Icon} from '../../../../../../../context_menu/Components/SvgIcons';
import {
  ArrowDuo_Icon,
  BoxDuo_Icon,
  CalendarDuo_Icon,
  Extensions2_Icon,
  HomeSmile_Icon,
  Plugins_Icon,
  UserDuo_Icon,
} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {usePluginsState} from '../../../../../Redux/Reducer/PluginsReducer';
import {useUserState} from '../../../../../Redux/Reducer/UserReducer';
import ActionButtons from './ActionButtons';

export default function PreviewHeader({installedExt}: {installedExt: InstalledPlugin | undefined}) {
  const selectedPlugin = usePluginsState('selectedPlugin');
  const syncList = usePluginsState('syncList');
  const updateChannel = useUserState('updateChannel');

  const {currentVersion, currentDate, targetUpdate, isUpgrade, targetVersion} = useMemo(() => {
    const targetInstallVersion = selectedPlugin ? selectedPlugin.versions.find(item => item.isCompatible) : undefined;

    const currentVersion = installedExt?.version.version || targetInstallVersion?.version || 'N/A';
    const targetUpdate = syncList.find(update => update.id === selectedPlugin?.metadata.id);
    const isUpgrade = targetUpdate?.type === 'upgrade';
    const targetVersion = targetUpdate?.version.version;
    const currentDate = selectedPlugin?.changes.find(item => item.version === currentVersion)?.date || 'N/A';

    return {currentVersion, currentDate, targetUpdate, isUpgrade, targetVersion};
  }, [installedExt, selectedPlugin, syncList, updateChannel]);

  return (
    <div className="w-full flex sm:flex-col lg:flex-row p-5 sm:gap-y-2 shrink-0">
      <div className="w-full flex flex-col">
        <User
          description={
            <div className="flex flex-row gap-x-2 items-center">
              <Chip
                size="sm"
                variant="light"
                className="text-foreground-600"
                startContent={<BoxDuo_Icon className="size-3.5" />}
                classNames={{content: 'flex flex-row items-center justify-center gap-x-1'}}>
                <span>v{currentVersion}</span>
                {targetUpdate && (
                  <>
                    <ArrowDuo_Icon className="size-3 rotate-180" />
                    <span className={`${isUpgrade ? 'text-success' : 'text-warning'}`}>v{targetVersion}</span>
                  </>
                )}
              </Chip>
              <Chip
                size="sm"
                variant="light"
                className="text-foreground-600"
                startContent={<CalendarDuo_Icon className="size-3.5" />}>
                {currentDate}
              </Chip>
              <div
                className={
                  `flex flex-row gap-x-1 items-center` +
                  ` ${selectedPlugin?.metadata.type === 'extension' ? 'text-primary-500' : 'text-secondary'}`
                }>
                {selectedPlugin?.metadata.type === 'extension' ? (
                  <>
                    <Plugins_Icon />
                    <span>Extension</span>
                  </>
                ) : (
                  <>
                    <Extensions2_Icon />
                    <span>Module</span>
                  </>
                )}
              </div>
            </div>
          }
          className="self-start"
          avatarProps={{src: selectedPlugin?.icon, className: 'bg-black/0', radius: 'none'}}
          name={<span className="font-semibold text-foreground text-xl">{selectedPlugin?.metadata.title}</span>}
        />
        <div className="flex flex-row items-center ml-12">
          <Chip variant="light" startContent={<UserDuo_Icon />}>
            {extractGitUrl(selectedPlugin?.url || '').owner}
          </Chip>
          <Button
            onPress={() => {
              AddBreadcrumb_Renderer(`Plugin homepage: id:${selectedPlugin?.metadata.id}`);
              window.open(selectedPlugin?.url);
            }}
            size="sm"
            variant="light"
            className="text-small"
            startContent={<HomeSmile_Icon />}
            endContent={<ExternalDuo_Icon className="size-3" />}>
            Home Page
          </Button>
        </div>
      </div>

      <ActionButtons installed={!!installedExt} targetUpdate={targetUpdate} currentVersion={currentVersion} />
    </div>
  );
}
