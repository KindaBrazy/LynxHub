import {DropdownItem, DropdownSection} from '@heroui/react';
import {UseCardStoreType} from '@lynx_common/types/plugins/extensions';
import {Bug, TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {useEffect} from 'react';

type Props = {useCardStore: UseCardStoreType};

export default function CardsAddMenu({useCardStore}: Props) {
  const title = useCardStore(state => state.title);

  useEffect(() => {
    console.log(title);
  }, [title]);

  return (
    <DropdownSection key="bugs" title="Bugs" showDivider>
      <DropdownItem key="addBug" title="Add Bug" startContent={<Bug />} className="cursor-default"></DropdownItem>
      <DropdownItem
        key="removeBug"
        title="Remove Bug"
        className="cursor-default"
        startContent={<TrashBin2 />}></DropdownItem>
    </DropdownSection>
  );
}
