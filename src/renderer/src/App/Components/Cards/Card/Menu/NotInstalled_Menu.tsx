import {Button, Dropdown, DropdownMenu, DropdownTrigger} from '@heroui/react';
import {memo} from 'react';

import {MenuDots_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {useSettingsState} from '../../../../Redux/Reducer/SettingsReducer';
import {useCardStore} from '../LynxCard-Wrapper';
import {MenuDuplicate, MenuHomePage} from './MenuItems/CardMenu-About';

const NotInstalled_Menu = memo(() => {
  const menuIsOpen = useCardStore(state => state.menuIsOpen);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);

  const compactMode = useSettingsState('cardsCompactMode');

  return (
    <Dropdown
      isOpen={menuIsOpen}
      closeOnSelect={false}
      onOpenChange={setMenuIsOpen}
      className="border !border-foreground-200/70"
      classNames={{base: 'before:bg-black/70', content: 'border-black/70'}}
      showArrow>
      <DropdownTrigger>
        <Button
          size={compactMode ? 'sm' : 'md'}
          startContent={<MenuDots_Icon className="size-[1.3rem] m-2 rotate-90" />}
          className="cursor-default bg-foreground-200 dark:bg-foreground-100 border-l-2 border-l-foreground/10"
          isIconOnly
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="Card Menu">
        {MenuHomePage()}
        {MenuDuplicate()}
      </DropdownMenu>
    </Dropdown>
  );
});

export default NotInstalled_Menu;
