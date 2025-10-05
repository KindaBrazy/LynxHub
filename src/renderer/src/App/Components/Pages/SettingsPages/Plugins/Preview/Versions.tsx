import {Button, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from '@heroui/react';
import {useEffect, useMemo, useState} from 'react';

import {SubscribeStages} from '../../../../../../../../cross/CrossTypes';
import {PluginUpdateList} from '../../../../../../../../cross/plugin/PluginTypes';
import {BoxDuo_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {useExtensionPageStore} from '../Page';

const getStageName = (stage: SubscribeStages) => {
  return stage === 'insider' ? 'Insider' : stage === 'early_access' ? 'Early Access' : 'Public';
};

const getColor = (stage: SubscribeStages) => {
  return stage === 'insider' ? 'secondary' : stage === 'early_access' ? 'primary' : 'success';
};

type Props = {
  targetUpdate: PluginUpdateList | undefined;
  currentVersion: string;
};
export default function Versions({targetUpdate, currentVersion}: Props) {
  const selectedPlugin = useExtensionPageStore(state => state.selectedPlugin);
  const [selectedVersion, setSelectedVersion] = useState<string>('');

  const {versions} = useMemo(() => {
    const versions = selectedPlugin?.versions || [];
    const version = versions.find(item => item.version === currentVersion);
    setSelectedVersion(version?.commit || '');

    return {versions};
  }, [selectedPlugin, targetUpdate, currentVersion]);

  useEffect(() => {
    console.log(selectedVersion);
  }, [selectedVersion]);

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
        selectedKeys={[selectedVersion]}
        onSelectionChange={onSelectionChange}
        disallowEmptySelection>
        {versions.map(v => (
          <DropdownItem
            endContent={
              <Chip size="sm" color={getColor(v.stage)}>
                {getStageName(v.stage)}
              </Chip>
            }
            key={v.commit}>
            v{v.version}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
