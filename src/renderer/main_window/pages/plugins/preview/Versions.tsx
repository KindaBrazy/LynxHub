import {ChipProps} from '@heroui/chip';
import {Button, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from '@heroui/react';
import {SubscribeStages} from '@lynx_common/types';
import pluginsIpc from '@lynx_shared/ipc/plugins';
import {useMemo} from 'react';

import {BoxDuo_Icon} from '../../../../shared/assets/icons';
import {usePluginsState} from '../../../redux/reducers/plugins';

const getStageName = (stage: SubscribeStages) => {
  return stage === 'insider' ? 'Insider' : stage === 'early_access' ? 'Early Access' : 'Public';
};

const getColor = (stage: SubscribeStages): ChipProps['color'] => {
  return stage === 'insider' ? 'secondary' : stage === 'early_access' ? 'primary' : 'success';
};

type Props = {currentVersion: string};
export default function Versions({currentVersion}: Props) {
  const selectedPlugin = usePluginsState('selectedPlugin');
  const syncList = usePluginsState('syncList');

  const {versions, disabledKeys, selectedVersion} = useMemo(() => {
    const versions = selectedPlugin?.versions || [];
    const version = versions.find(item => item.version === currentVersion);
    const disabledKeys = versions.filter(item => !item.isCompatible).map(item => item.commit);

    const sync = syncList.find(item => item.id === selectedPlugin?.metadata.id);
    const selectedVersion = sync?.commit || version?.commit || '';

    return {versions, disabledKeys, selectedVersion};
  }, [selectedPlugin, syncList, currentVersion]);

  const onSelectionChange = value => {
    const commit = Array.from(value)[0] as string;
    const id = selectedPlugin?.metadata.id;
    if (id) pluginsIpc.updateSyncList(id, commit);
  };

  return (
    <Dropdown size="sm" showArrow>
      <DropdownTrigger>
        <Button size="sm" variant="flat" startContent={<BoxDuo_Icon className="size-3.5" />}>
          Target v{versions.find(item => item.commit === selectedVersion)?.version}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        variant="flat"
        selectionMode="single"
        disabledKeys={disabledKeys}
        selectedKeys={[selectedVersion]}
        onSelectionChange={onSelectionChange}
        disallowEmptySelection>
        {versions.map(v => (
          <DropdownItem
            endContent={
              <Chip size="sm" variant="flat" className="scale-80" color={getColor(v.stage)}>
                {getStageName(v.stage)}
              </Chip>
            }
            key={v.commit}
            description={v.incompatibleReason}
            classNames={{description: 'whitespace-pre text-warning'}}>
            v{v.version}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
