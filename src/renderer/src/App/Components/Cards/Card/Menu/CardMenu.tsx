import {Button, Dropdown, DropdownMenu, DropdownSection, DropdownTrigger} from '@nextui-org/react';
import {observer} from 'mobx-react-lite';

import {MenuDots_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons2';
import {useSettingsState} from '../../../../Redux/App/SettingsReducer';
import {useUpdatingCard} from '../../../../Utils/UtilHooks';
import {useCardData} from '../../CardsDataManager';
import {MenuInfo, MenuReadme} from './MenuItems/CardMenu-About';
import {MenuUninstall} from './MenuItems/CardMenu-Danger';
import {MenuExtensions, MenuLaunchConfig, MenuPin} from './MenuItems/CardMenu-Options';
import {MenuAutoUpdate, MenuCheckForUpdate, MenuUpdate} from './MenuItems/CardMenu-Update';

export const CardMenu = observer(() => {
  const {id, menuIsOpen, setMenuIsOpen} = useCardData();
  const compactMode = useSettingsState('cardsCompactMode');
  const updating = useUpdatingCard(id);

  return (
    <div className="flex">
      <Dropdown
        isOpen={menuIsOpen}
        closeOnSelect={false}
        onOpenChange={setMenuIsOpen}
        className="border !border-foreground-200/70"
        classNames={{base: 'before:bg-black/70', content: 'border-black/70'}}
        showArrow>
        <DropdownTrigger>
          <Button
            radius="sm"
            isLoading={!!updating}
            size={compactMode ? 'sm' : 'md'}
            className="cursor-default bg-foreground-200 dark:bg-foreground-100"
            startContent={!updating && <MenuDots_Icon className="size-[1.3rem] m-2 rotate-90" />}
            isIconOnly
          />
        </DropdownTrigger>
        <DropdownMenu aria-label="Card Menu">
          <DropdownSection key="options" showDivider>
            {MenuLaunchConfig()}
            {MenuExtensions()}
            {MenuPin()}
          </DropdownSection>
          <DropdownSection key="update" showDivider>
            {MenuUpdate()}
            {MenuCheckForUpdate()}
            {MenuAutoUpdate()}
          </DropdownSection>
          <DropdownSection key="danger-zone">
            {MenuInfo()}
            {MenuReadme()}
            {MenuUninstall()}
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
});

export default CardMenu;
