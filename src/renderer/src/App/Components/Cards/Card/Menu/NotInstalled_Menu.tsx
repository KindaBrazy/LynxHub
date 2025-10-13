import {Button, Dropdown, DropdownMenu, DropdownTrigger} from '@heroui/react';
import {memo} from 'react';

import {MenuDots_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {useCardStore} from '../LynxCard-Wrapper';
import {MenuDuplicate, MenuHomePage} from './MenuItems/CardMenu-About';

const NotInstalled_Menu = memo(() => {
  const menuIsOpen = useCardStore(state => state.menuIsOpen);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);

  return (
    <Dropdown
      isOpen={menuIsOpen}
      closeOnSelect={false}
      onOpenChange={setMenuIsOpen}
      className="border !border-foreground-200/70"
      classNames={{base: 'before:bg-black/70', content: 'border-black/70'}}
      showArrow>
      <DropdownTrigger>
        <Button radius="lg" variant="flat" isIconOnly>
          <MenuDots_Icon className="size-[1.3rem]" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Card Menu">
        {MenuHomePage()}
        {MenuDuplicate()}
      </DropdownMenu>
    </Dropdown>
  );
});

export default NotInstalled_Menu;
