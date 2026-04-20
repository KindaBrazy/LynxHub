import {Button, Dropdown, Header} from '@heroui-v3/react';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {useUpdatingCard} from '@lynx/utils/hooks';
import {MenuDots} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useMemo} from 'react';

import {useCardStore} from '../store';
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
    <Dropdown isOpen={menuIsOpen} onOpenChange={setMenuIsOpen}>
      <Button variant="tertiary" isPending={updating} isIconOnly>
        {!updating && (
          <MenuDots className={`size-[1.3rem] ${menuIsOpen ? 'rotate-90' : 'rotate-0'} transition-all duration-500`} />
        )}
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu aria-label="Card Menu">
          {first.map((Comp, index) => {
            return <Comp key={index} useCardStore={useCardStore} />;
          })}
          <Dropdown.Section>
            <Header>Options</Header>
            <LaunchConfigMenuItem />
            <ExtensionsMenuItem />
            <RepoConfigMenuItem />
          </Dropdown.Section>

          {second.map((Comp, index) => {
            return <Comp key={index} useCardStore={useCardStore} />;
          })}
          <Dropdown.Section>
            <Header>Update</Header>
            <UpdateMenuItem />
            <CheckForUpdateMenuItem />
            <AutoUpdateMenuItem />
          </Dropdown.Section>

          <Dropdown.Section>
            <Header>Other</Header>
            <Dropdown.SubmenuTrigger>
              <Dropdown.Item>
                Other
                <Dropdown.SubmenuIndicator />
              </Dropdown.Item>
              <Dropdown.Popover>
                <Dropdown.Menu>
                  {third.map((Comp, index) => {
                    return <Comp key={index} useCardStore={useCardStore} />;
                  })}
                  <Dropdown.Section key="info">
                    <Header>Info</Header>
                    <AboutMenuItem />
                    <HomePageMenuItem />
                  </Dropdown.Section>

                  <Dropdown.Section key="card_modify">
                    <Header>Danger Zone</Header>
                    <DuplicateMenuItem />
                    <UnAssignMenuItem />
                    <UninstallMenuItem />
                  </Dropdown.Section>
                  {fourth.map((Comp, index) => {
                    return <Comp key={index} useCardStore={useCardStore} />;
                  })}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown.SubmenuTrigger>
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
});

export default InstalledMenu;
