import {Button, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from '@heroui/react';
import {useEffect, useMemo, useState} from 'react';

import {SubscribeStages} from '../../../../../../../../cross/CrossTypes';
import {PluginAvailableItem, PluginUpdateList} from '../../../../../../../../cross/plugin/PluginTypes';
import {BoxDuo_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';

type Props = {
  selectedExt: PluginAvailableItem | undefined;
  targetUpdate: PluginUpdateList | undefined;
  currentVersion: string;
};

const getStageName = (stage: SubscribeStages) => {
  return stage === 'insider' ? 'Insider' : stage === 'early_access' ? 'Early Access' : 'Public';
};

const getColor = (stage: SubscribeStages) => {
  return stage === 'insider' ? 'secondary' : stage === 'early_access' ? 'primary' : 'success';
};

export default function Versions({selectedExt, targetUpdate, currentVersion}: Props) {
  const [selectedVersion, setSelectedVersion] = useState<string>('');

  const {versions} = useMemo(() => {
    const versions = selectedExt?.versioning.versions || [];
    const version = versions.find(item => item.version === currentVersion);
    setSelectedVersion(version?.commit || '');

    return {versions};
  }, [selectedExt, targetUpdate, currentVersion]);

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
