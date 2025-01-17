import {DropdownItem, DropdownSection} from '@heroui/react';
import {useEffect} from 'react';

import {CardsDataManager} from '../../src/App/Components/Cards/CardsDataManager';
import {Bug_Icon, Trash_Icon} from '../../src/assets/icons/SvgIcons/SvgIcons3';

export default function CardsAddMenu({context}: {context: CardsDataManager}) {
  useEffect(() => {
    console.log(context.id);
  }, [context]);

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
