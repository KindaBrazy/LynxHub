import {Button, Chip, Description, Dropdown, Label, Selection} from '@heroui/react';
import {usePluginsState} from '@lynx/redux/reducers/plugins';
import pluginsIpc from '@lynx_shared/ipc/plugins';
import {BoxMinimalistic} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback, useMemo} from 'react';

import {getStageColor, getStageDisplayName} from './utils';

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
export default function PluginVersionSelector({currentVersion}: PluginVersionSelectorProps) {
  const selectedPlugin = usePluginsState('selectedPlugin');
  const syncList = usePluginsState('syncList');

  /**
   * Derives the available versions, currently selected sync version, and disabled versions
   * (incompatible) based on the plugin's metadata and existing sync items.
   */
  const {availableVersions, disabledCommitKeys, activeCommit} = useMemo(() => {
    const availableVersions = selectedPlugin?.versions || [];
    const installedVersionEntry = availableVersions.find(item => item.version === currentVersion);
    const disabledCommitKeys = availableVersions.filter(item => !item.isCompatible).map(item => item.commit);

    // Check if there is already a pending sync entry for this plugin
    const pendingSyncEntry = syncList.find(item => item.id === selectedPlugin?.metadata.id);
    const activeCommit = pendingSyncEntry?.commit || installedVersionEntry?.commit || '';

    return {availableVersions, disabledCommitKeys, activeCommit};
  }, [selectedPlugin, syncList, currentVersion]);

  /**
   * Handles selection changes in the version dropdown.
   * Updates the sync list via IPC to mark the target version for synchronization.
   */
  const handleSelectionChange = useCallback(
    (selection: Selection) => {
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
    <Dropdown>
      <Dropdown.Trigger>
        <Button size="sm" variant="tertiary">
          <BoxMinimalistic className="size-3.5" />
          Target v{activeVersionNumber}
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Popover>
        <Dropdown.Menu
          selectionMode="single"
          selectedKeys={[activeCommit]}
          disabledKeys={disabledCommitKeys}
          onSelectionChange={handleSelectionChange}
          disallowEmptySelection>
          {availableVersions.map(version => (
            <Dropdown.Item key={version.commit} className="justify-between">
              <div className="flex flex-col size-full">
                <Label
                  className={`justify-between w-full flex ${
                    version.incompatibleReason ? 'text-warning' : 'text-success'
                  }`}>
                  {version.version}
                  <Chip size="sm" variant="soft" color={getStageColor(version.stage)}>
                    {getStageDisplayName(version.stage)}
                  </Chip>
                </Label>
                <Description className="text-warning/50">{version.incompatibleReason}</Description>
              </div>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
