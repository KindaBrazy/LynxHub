import {Button, Chip, User} from '@heroui/react';
import {Dispatch, SetStateAction, useMemo} from 'react';

import {extractGitUrl} from '../../../../../../../../cross/CrossUtils';
import {getTargetVersion} from '../../../../../../../../cross/plugin/CrossPluginUtils';
import {InstalledPlugin, PluginAvailableItem} from '../../../../../../../../cross/plugin/PluginTypes';
import AddBreadcrumb_Renderer from '../../../../../../../Breadcrumbs';
import {ExternalDuo_Icon} from '../../../../../../../context_menu/Components/SvgIcons';
import {
  ArrowDuo_Icon,
  BoxDuo_Icon,
  CalendarDuo_Icon,
  HomeSmile_Icon,
  UserDuo_Icon,
} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {useSettingsState} from '../../../../../Redux/Reducer/SettingsReducer';
import {useUserState} from '../../../../../Redux/Reducer/UserReducer';
import ActionButtons from './ActionButtons';

export default function PreviewHeader({
  selectedExt,
  installedExt,
  setInstalled,
}: {
  selectedExt: PluginAvailableItem | undefined;
  installedExt: InstalledPlugin | undefined;
  setInstalled: Dispatch<SetStateAction<InstalledPlugin[]>>;
}) {
  const updateAvailable = useSettingsState('pluginUpdateAvailableList');
  const updateChannel = useUserState('updateChannel');

  const {currentVersion, targetUpdate, isUpgrade, targetVersion} = useMemo(() => {
    const targetInstallVersion = selectedExt
      ? getTargetVersion(selectedExt?.versioning.versions, updateChannel)
      : undefined;

    const currentVersion = installedExt?.version.version || targetInstallVersion?.version || 'N/A';
    const targetUpdate = updateAvailable.find(update => update.id === selectedExt?.metadata.id);
    const isUpgrade = targetUpdate?.type === 'upgrade';
    const targetVersion = targetUpdate?.version.version;

    return {currentVersion, targetUpdate, isUpgrade, targetVersion};
  }, [installedExt, selectedExt, updateAvailable, updateChannel]);

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
                {selectedExt?.versioning.changes[0].date}
              </Chip>
            </div>
          }
          className="self-start"
          avatarProps={{src: selectedExt?.icon, className: 'bg-black/0', radius: 'none'}}
          name={<span className="font-semibold text-foreground text-xl">{selectedExt?.metadata.title}</span>}
        />
        <div className="flex flex-row items-center ml-12">
          <Chip variant="light" startContent={<UserDuo_Icon />}>
            {extractGitUrl(selectedExt?.url || '').owner}
          </Chip>
          <Button
            onPress={() => {
              AddBreadcrumb_Renderer(`Plugin homepage: id:${selectedExt?.metadata.id}`);
              window.open(selectedExt?.url);
            }}
            size="sm"
            variant="light"
            startContent={<HomeSmile_Icon />}
            className="text-small text-primary-500"
            endContent={<ExternalDuo_Icon className="size-3" />}>
            Home Page
          </Button>
        </div>
      </div>

      <ActionButtons
        selectedExt={selectedExt}
        installed={!!installedExt}
        targetUpdate={targetUpdate}
        setInstalled={setInstalled}
        currentVersion={currentVersion}
      />
    </div>
  );
}
