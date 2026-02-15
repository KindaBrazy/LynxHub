import {Button, Chip, User} from '@heroui/react';
import {usePluginsState} from '@lynx/redux/reducers/plugins';
import {useUserState} from '@lynx/redux/reducers/user';
import {PluginInstalledItem} from '@lynx_common/types/plugins';
import {extractGitUrl, getCacheUrl} from '@lynx_common/utils';
import {getPluginIconUrl} from '@lynx_common/utils/plugins';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {
  BoxMinimalistic,
  CalendarMinimalistic,
  HomeAngle2,
  SquareTopDown,
  User as UserIcon,
  WidgetAdd,
} from '@solar-icons/react-perf/BoldDuotone';
import {ArrowRight} from '@solar-icons/react-perf/LineDuotone';
import {useMemo} from 'react';

import ActionButtons from './ActionButtons';

export default function PreviewHeader({installedExt}: {installedExt: PluginInstalledItem | undefined}) {
  const selectedPlugin = usePluginsState('selectedPlugin');
  const syncList = usePluginsState('syncList');
  const updateChannel = useUserState('updateChannel');

  const {currentVersion, currentDate, isUpgrade, targetVersion} = useMemo(() => {
    const targetInstallVersion = selectedPlugin ? selectedPlugin.versions.find(item => item.isCompatible) : undefined;

    const currentVersion = installedExt?.version || targetInstallVersion?.version || 'N/A';
    const targetUpdate = syncList.find(update => update.id === selectedPlugin?.metadata.id);
    const isUpgrade = targetUpdate?.type === 'upgrade';
    const targetVersion = targetUpdate?.version;
    const currentDate = selectedPlugin?.changes.find(item => item.version === currentVersion)?.date || 'N/A';

    return {currentVersion, currentDate, isUpgrade, targetVersion};
  }, [installedExt, selectedPlugin, syncList, updateChannel]);

  return (
    <div className="w-full flex sm:flex-col lg:flex-row p-5 sm:gap-y-2 shrink-0">
      <div className="w-full flex flex-col">
        <User
          avatarProps={{
            src: getCacheUrl(getPluginIconUrl(selectedPlugin?.url)),
            className: 'bg-black/0',
            showFallback: true,
            name: selectedPlugin?.metadata.title,
            radius: 'none',
          }}
          description={
            <div className="flex flex-row gap-x-2 items-center">
              <Chip
                size="sm"
                variant="light"
                className="text-foreground-600"
                startContent={<BoxMinimalistic className="size-3.5" />}
                classNames={{content: 'flex flex-row items-center justify-center gap-x-1'}}>
                <span>v{currentVersion}</span>
                {targetVersion && (
                  <>
                    <ArrowRight className="size-3" />
                    <span className={`${isUpgrade ? 'text-success' : 'text-warning'}`}>v{targetVersion}</span>
                  </>
                )}
              </Chip>
              <Chip
                size="sm"
                variant="light"
                className="text-foreground-600"
                startContent={<CalendarMinimalistic className="size-3.5" />}>
                {currentDate}
              </Chip>
              <div
                className={
                  `flex flex-row gap-x-1 items-center` +
                  ` ${selectedPlugin?.metadata.type === 'extension' ? 'text-primary-500' : 'text-secondary'}`
                }>
                <WidgetAdd />
                {selectedPlugin?.metadata.type === 'extension' ? <span>Extension</span> : <span>Module</span>}
              </div>
            </div>
          }
          className="self-start"
          name={<span className="font-semibold text-foreground text-xl">{selectedPlugin?.metadata.title}</span>}
        />
        <div className="flex flex-row items-center ml-12">
          <Chip variant="light" startContent={<UserIcon />}>
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
            startContent={<HomeAngle2 />}
            endContent={<SquareTopDown className="size-3" />}>
            Home Page
          </Button>
        </div>
      </div>

      <ActionButtons installed={!!installedExt} currentVersion={currentVersion} />
    </div>
  );
}
