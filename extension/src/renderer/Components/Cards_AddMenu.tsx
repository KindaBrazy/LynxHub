import {DropdownItem, DropdownSection} from '@heroui/react';
import {useEffect} from 'react';

import {UseCardStoreType} from '../../../../src/cross/plugin/ExtensionTypes_Renderer';
import {Bug_Icon, Trash_Icon} from '../../../../src/renderer/src/assets/icons/SvgIcons/SvgIcons';

type Props = {useCardStore: UseCardStoreType};

export default function CardsAddMenu({useCardStore}: Props) {
  const title = useCardStore(state => state.title);

  useEffect(() => {
    console.log(title);
  }, [title]);

  return (
    <DropdownSection key="bugs" title="Bugs" showDivider>
      <DropdownItem key="addBug" title="Add Bug" className="cursor-default" startContent={<Bug_Icon />}></DropdownItem>
      <DropdownItem
        key="removeBug"
        title="Remove Bug"
        className="cursor-default"
        startContent={<Trash_Icon />}></DropdownItem>
    </DropdownSection>
  );
}
