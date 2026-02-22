import { ChipProps } from '@heroui/chip';
import { Button, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, SharedSelection } from '@heroui/react';
import { usePluginsState } from '@lynx/redux/reducers/plugins';
import { SubscribeStages } from '@lynx_common/types';
import pluginsIpc from '@lynx_shared/ipc/plugins';
import { BoxMinimalistic } from '@solar-icons/react-perf/BoldDuotone';
import { useCallback, useMemo } from 'react';

/**
 * Returns a user-friendly name for a given subscription stage.
 */
function getStageDisplayName(stage: SubscribeStages) {
  switch (stage) {
    case 'insider':
      return 'Insider';
    case 'early_access':
      return 'Early Access';
    default:
      return 'Public';
  }
}

/**
 * Returns the appropriate color for a stage indicator chip.
 */
function getStageColor(stage: SubscribeStages): ChipProps['color'] {
  switch (stage) {
    case 'insider':
      return 'secondary';
    case 'early_access':
      return 'primary';
    default:
      return 'success';
  }
}

/**
 * Props for the {@link PluginVersionSelector} component.
 */
interface PluginVersionSelectorProps {
  /** The currently installed version of the plugin. */
  currentVersion: string;
}

/**
 * Dropdown selector that allows users to choose a specific version/commit of a plugin to sync to.
 * Primarily used for upgrading, downgrading, or switching between release tracks.
 */
export default function PluginVersionSelector({ currentVersion }: PluginVersionSelectorProps) {
  const selectedPlugin = usePluginsState('selectedPlugin');
  const syncList = usePluginsState('syncList');

  /**
   * Derives the available versions, currently selected sync version, and disabled versions
   * (incompatible) based on the plugin's metadata and existing sync items.
   */
  const { availableVersions, disabledCommitKeys, activeCommit } = useMemo(() => {
    const availableVersions = selectedPlugin?.versions || [];
    const installedVersionEntry = availableVersions.find(item => item.version === currentVersion);
    const disabledCommitKeys = availableVersions.filter(item => !item.isCompatible).map(item => item.commit);

    // Check if there is already a pending sync entry for this plugin
    const pendingSyncEntry = syncList.find(item => item.id === selectedPlugin?.metadata.id);
    const activeCommit = pendingSyncEntry?.commit || installedVersionEntry?.commit || '';

    return { availableVersions, disabledCommitKeys, activeCommit };
  }, [selectedPlugin, syncList, currentVersion]);

  /**
   * Handles selection changes in the version dropdown.
   * Updates the sync list via IPC to mark the target version for synchronization.
   */
  const handleSelectionChange = useCallback(
    (selection: SharedSelection) => {
      const targetCommit = Array.from(selection)[0] as string;
      const pluginId = selectedPlugin?.metadata.id;

      if (pluginId && targetCommit) {
        pluginsIpc.updateSyncList(pluginId, targetCommit);
      }
    },
    [selectedPlugin?.metadata.id],
  );

  const activeVersionNumber = availableVersions.find(item => item.commit === activeCommit)?.version;

  return (
    <Dropdown size="sm" showArrow>
      <DropdownTrigger>
        <Button size="sm" variant="flat" startContent={<BoxMinimalistic className="size-3.5" />}>
          Target v{activeVersionNumber}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        variant="flat"
        selectionMode="single"
        disabledKeys={disabledCommitKeys}
        selectedKeys={[activeCommit]}
        onSelectionChange={handleSelectionChange}
        disallowEmptySelection>
        {availableVersions.map(version => (
          <DropdownItem
            key={version.commit}
            description={version.incompatibleReason}
            classNames={{ description: 'whitespace-pre text-warning' }}
            endContent={
              <Chip size="sm" variant="flat" className="scale-80" color={getStageColor(version.stage)}>
                {getStageDisplayName(version.stage)}
              </Chip>
            }>
            v{version.version}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
