// @ts-nocheck
import {Button, Dropdown, DropdownMenu, DropdownSection, DropdownTrigger} from '@heroui/react';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {useUpdatingCard} from '@lynx/utils/hooks';
import {MenuDots} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useMemo} from 'react';

import {useCardStore} from '../Wrapper';
import {AboutMenuItem, DuplicateMenuItem, HomePageMenuItem} from './items/About';
import {UnAssignMenuItem, UninstallMenuItem} from './items/DangerZone';
import {ExtensionsMenuItem, LaunchConfigMenuItem, RepoConfigMenuItem} from './items/Options';
import {AutoUpdateMenuItem, CheckForUpdateMenuItem, UpdateMenuItem} from './items/Update';

export const InstalledMenu = memo(() => {
  const id = useCardStore(state => state.id);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);
  const menuIsOpen = useCardStore(state => state.menuIsOpen);

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
      className="border border-foreground-100!"
      classNames={{base: 'before:bg-foreground-100', content: 'border-foreground-100'}}
      showArrow>
      <DropdownTrigger>
        <Button radius="lg" variant="flat" color="primary" isLoading={updating} isIconOnly>
          {!updating && (
            <MenuDots
              className={`size-[1.3rem] ${menuIsOpen ? 'rotate-90' : 'rotate-0'} transition-all duration-500`}
            />
          )}
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Card Menu">
        {first.map((Comp, index) => {
          return Comp({key: index, useCardStore});
        })}
        <DropdownSection key="options" classNames={{divider: 'bg-foreground-100'}} showDivider>
          {LaunchConfigMenuItem()}
          {ExtensionsMenuItem()}
          {RepoConfigMenuItem()}
        </DropdownSection>
        {second.map((Comp, index) => {
          return Comp({key: index, useCardStore});
        })}
        <DropdownSection key="update" classNames={{divider: 'bg-foreground-100'}} showDivider>
          {UpdateMenuItem()}
          {CheckForUpdateMenuItem()}
          {AutoUpdateMenuItem()}
        </DropdownSection>
        {third.map((Comp, index) => {
          return Comp({key: index, useCardStore});
        })}
        <DropdownSection key="info" classNames={{divider: 'bg-foreground-100'}} showDivider>
          {AboutMenuItem()}
          {HomePageMenuItem()}
        </DropdownSection>
        <DropdownSection key="card_modify">
          {DuplicateMenuItem()}
          {UnAssignMenuItem()}
          {UninstallMenuItem()}
        </DropdownSection>

        {fourth.map((Comp, index) => {
          return Comp({key: index, useCardStore});
        })}
      </DropdownMenu>
    </Dropdown>
  );
});

export default InstalledMenu;
