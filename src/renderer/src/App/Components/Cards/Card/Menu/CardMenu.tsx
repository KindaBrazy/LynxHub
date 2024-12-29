import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from '@nextui-org/react';
import {isEmpty} from 'lodash';
import {observer} from 'mobx-react-lite';
import {useCallback, useMemo, useState} from 'react';

import {MenuDots_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons2';
import {extensionsData} from '../../../../Extensions/ExtensionLoader';
import {useSettingsState} from '../../../../Redux/App/SettingsReducer';
import {DropDownSectionType} from '../../../../Utils/Types';
import {useUpdatingCard} from '../../../../Utils/UtilHooks';
import {useCardData} from '../../CardsDataManager';
import useCardMenuSections from './UseCardMenuSections';

export const CardMenu = observer(() => {
  const {id, menuIsOpen, setMenuIsOpen} = useCardData();
  const compactMode = useSettingsState('cardsCompactMode');
  const updating = useUpdatingCard(id);
  const menuSections = useCardMenuSections();

  const [resultSections, setResultSections] = useState<DropDownSectionType[]>([]);

  const addMenu = useCallback(
    (sections: DropDownSectionType[], index: number = 2) => {
      const combinedSections = [...menuSections];
      combinedSections.splice(index, 0, ...sections);
      setResultSections(combinedSections);
    },
    [menuSections],
  );

  const extensionAddMenu = useMemo(() => extensionsData.cards.customize.menu.addSection, []);

  return (
    <div className="flex">
      {extensionAddMenu.map((AddMenu, index) => (
        <AddMenu key={index} addMenu={addMenu} context={useCardData()} />
      ))}
      <Dropdown
        type="menu"
        isOpen={menuIsOpen}
        closeOnSelect={false}
        onOpenChange={setMenuIsOpen}
        className="border-2 !border-foreground/5"
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
        <DropdownMenu
          variant="faded"
          aria-label="Card Menu"
          items={isEmpty(resultSections) ? menuSections : resultSections}>
          {sectionData => (
            <DropdownSection {...sectionData} key={`${sectionData.key}_section`}>
              {item => <DropdownItem {...item} key={`${item.key}_item`} />}
            </DropdownSection>
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
});

export default CardMenu;
