import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from '@nextui-org/react';
import {observer} from 'mobx-react-lite';
import {useMemo} from 'react';

import {getIconByName} from '../../../../../assets/icons/SvgIconsContainer';
import {useSettingsState} from '../../../../Redux/App/SettingsReducer';
import {useUpdatingCard} from '../../../../Utils/UtilHooks';
import {useCardData} from '../../CardsDataManager';
import useCardMenuSections from './UseCardMenuSections';

export const CardMenu = observer(() => {
  const {id, menuIsOpen, setMenuIsOpen} = useCardData();
  const compactMode = useSettingsState('cardsCompactMode');
  const updating = useUpdatingCard(id);
  const menuSections = useCardMenuSections();

  const buttonSize = useMemo(() => (compactMode ? 'sm' : 'md'), [compactMode]);
  const menuIcon = useMemo(() => !updating && getIconByName('MenuDots', {className: 'size-full m-2'}), [updating]);

  return (
    <div className="flex">
      <Dropdown
        type="menu"
        isOpen={menuIsOpen}
        closeOnSelect={false}
        onOpenChange={setMenuIsOpen}
        classNames={{base: 'before:bg-black/70', content: 'border-black/70'}}
        showArrow>
        <DropdownTrigger>
          <Button
            variant="solid"
            size={buttonSize}
            isLoading={!!updating}
            startContent={menuIcon}
            className="cursor-default !rounded-l-none !rounded-r-xl"
            isIconOnly
          />
        </DropdownTrigger>
        <DropdownMenu items={menuSections} aria-label="Card Menu">
          {sectionData => {
            const {items, ...section} = sectionData;
            return (
              <DropdownSection items={items} {...section} key={`${sectionData.key}_section`}>
                {item => <DropdownItem {...item} key={`${item.key}_item`} />}
              </DropdownSection>
            );
          }}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
});

export default CardMenu;
