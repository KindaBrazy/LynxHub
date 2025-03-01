import {Button, Dropdown, DropdownMenu, DropdownTrigger} from '@heroui/react';
import {observer} from 'mobx-react-lite';

import {MenuDots_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons2';
import {useSettingsState} from '../../../../Redux/Reducer/SettingsReducer';
import {useCardData} from '../../CardsDataManager';
import {MenuDuplicate, MenuHomePage} from './MenuItems/CardMenu-About';

const NotInstalled_Menu = observer(() => {
  const {menuIsOpen, setMenuIsOpen} = useCardData();
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
