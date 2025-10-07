import {ChipProps} from '@heroui/chip';
import {Button, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from '@heroui/react';
import {useMemo, useState} from 'react';

import {SubscribeStages} from '../../../../../../../../cross/CrossTypes';
import {BoxDuo_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {usePluginsState} from '../../../../../Redux/Reducer/PluginsReducer';
import rendererIpc from '../../../../../RendererIpc';

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
  const [selectedVersion, setSelectedVersion] = useState<string>('');

  const {versions, disabledKeys} = useMemo(() => {
    const versions = selectedPlugin?.versions || [];
    const version = versions.find(item => item.version === currentVersion);

    const sync = syncList.find(item => item.version === currentVersion);
    setSelectedVersion(sync?.commit || version?.commit || '');

    const disabledKeys = versions.filter(item => !item.isCompatible).map(item => item.commit);

    return {versions, disabledKeys};
  }, [selectedPlugin, syncList, currentVersion]);

  const onSelectionChange = value => {
    const commit = Array.from(value)[0] as string;
    const id = selectedPlugin?.metadata.id;

    setSelectedVersion(commit);
    if (id) rendererIpc.plugins.updateSync(id, commit);
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
