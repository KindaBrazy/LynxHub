import {Button, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from '@heroui/react';
import {useMemo, useState} from 'react';

import {SubscribeStages} from '../../../../../../../../cross/CrossTypes';
import {PluginSyncList} from '../../../../../../../../cross/plugin/PluginTypes';
import {BoxDuo_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {usePluginsState} from '../../../../../Redux/Reducer/PluginsReducer';

const getStageName = (stage: SubscribeStages) => {
  return stage === 'insider' ? 'Insider' : stage === 'early_access' ? 'Early Access' : 'Public';
};

const getColor = (stage: SubscribeStages) => {
  return stage === 'insider' ? 'secondary' : stage === 'early_access' ? 'primary' : 'success';
};

type Props = {
  targetUpdate: PluginSyncList | undefined;
  currentVersion: string;
};
export default function Versions({targetUpdate, currentVersion}: Props) {
  const selectedPlugin = usePluginsState('selectedPlugin');
  const [selectedVersion, setSelectedVersion] = useState<string>('');

  const {versions, disabledKeys} = useMemo(() => {
    const versions = selectedPlugin?.versions || [];
    const version = versions.find(item => item.version === currentVersion);
    setSelectedVersion(version?.commit || '');

    const disabledKeys = versions.filter(item => !item.isCompatible).map(item => item.commit);

    return {versions, disabledKeys};
  }, [selectedPlugin, targetUpdate, currentVersion]);

  const onSelectionChange = value => {
    setSelectedVersion(Array.from(value)[0] as string);
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
              <Chip size="sm" className="scale-80" color={getColor(v.stage)}>
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
