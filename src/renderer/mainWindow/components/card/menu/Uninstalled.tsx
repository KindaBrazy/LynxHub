import {Button, Dropdown, DropdownMenu, DropdownTrigger} from '@heroui/react';
import {MenuDots} from '@solar-icons/react-perf/BoldDuotone';
import {memo} from 'react';

import {useCardStore} from '../Wrapper';
import {DuplicateMenuItem, HomePageMenuItem} from './items/About';

const UninstalledMenu = memo(() => {
  const menuIsOpen = useCardStore(state => state.menuIsOpen);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);

  return (
    <Dropdown
      isOpen={menuIsOpen}
      closeOnSelect={false}
      onOpenChange={setMenuIsOpen}
      className="border border-foreground-200/70!"
      classNames={{base: 'before:bg-black/70', content: 'border-black/70'}}
      showArrow>
      <DropdownTrigger>
        <Button radius="lg" variant="flat" isIconOnly>
          <MenuDots className={`size-[1.3rem] ${menuIsOpen ? 'rotate-90' : 'rotate-0'} transition-all duration-500`} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Card Menu">
        {HomePageMenuItem()}
        {DuplicateMenuItem()}
      </DropdownMenu>
    </Dropdown>
  );
});

export default UninstalledMenu;
