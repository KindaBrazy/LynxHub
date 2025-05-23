// @ts-nocheck
import {Button, Dropdown, DropdownMenu, DropdownSection, DropdownTrigger} from '@heroui/react';
import {observer} from 'mobx-react-lite';
import {useMemo} from 'react';

import {MenuDots_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {extensionsData} from '../../../../Extensions/ExtensionLoader';
import {useSettingsState} from '../../../../Redux/Reducer/SettingsReducer';
import {useUpdatingCard} from '../../../../Utils/UtilHooks';
import {useCardData} from '../../CardsDataManager';
import {MenuDuplicate, MenuHomePage, MenuInfo} from './MenuItems/CardMenu-About';
import {MenuUninstall} from './MenuItems/CardMenu-Danger';
import {MenuExtensions, MenuLaunchConfig, MenuRepoConfig} from './MenuItems/CardMenu-Options';
import {MenuAutoUpdate, MenuCheckForUpdate, MenuUpdate} from './MenuItems/CardMenu-Update';

export const CardMenu = observer(() => {
  const {id, menuIsOpen, setMenuIsOpen} = useCardData();
  const compactMode = useSettingsState('cardsCompactMode');
  const updating = useUpdatingCard(id);

  const {first, second, third, fourth} = useMemo(() => {
    const sections = extensionsData.cards.customize.menu.addSection;

    const first = sections.find(item => item.index === 0)?.components || [];
    const second = sections.find(item => item.index === 1)?.components || [];
    const third = sections.find(item => item.index === 2)?.components || [];
    const fourth = sections.find(item => item.index === 3)?.components || [];

    return {first, second, third, fourth};
  }, []);

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
          isLoading={!!updating}
          size={compactMode ? 'sm' : 'md'}
          className="cursor-default bg-foreground-200 dark:bg-foreground-100"
          startContent={!updating && <MenuDots_Icon className="size-[1.3rem] m-2 rotate-90" />}
          isIconOnly
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="Card Menu">
        {first.map((Comp, index) => {
          return Comp({key: index, context: useCardData()});
        })}
        <DropdownSection key="options" showDivider>
          {MenuLaunchConfig()}
          {MenuExtensions()}
          {MenuRepoConfig()}
        </DropdownSection>
        {second.map((Comp, index) => {
          return Comp({key: index, context: useCardData()});
        })}
        <DropdownSection key="update" showDivider>
          {MenuUpdate()}
          {MenuCheckForUpdate()}
          {MenuAutoUpdate()}
        </DropdownSection>
        {third.map((Comp, index) => {
          return Comp({key: index, context: useCardData()});
        })}
        <DropdownSection key="danger-zone">
          {MenuInfo()}
          {MenuHomePage()}
          {MenuDuplicate()}
          {MenuUninstall()}
        </DropdownSection>

        {fourth.map((Comp, index) => {
          return Comp({key: index, context: useCardData()});
        })}
      </DropdownMenu>
    </Dropdown>
  );
});

export default CardMenu;
