import {Button, Dropdown, Separator, useOverlayState} from '@heroui-v3/react';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {useUpdatingCard} from '@lynx/utils/hooks';
import {MenuDots} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useMemo} from 'react';

import {useCardStore} from '../store';
import {AboutMenuItem, DuplicateMenuItem, HomePageMenuItem} from './about';
import CardInfoModal from './about/infoModal';
import ReadmeModal from './about/ReadmeModal';
import {UnAssignMenuItem, UninstallMenuItem} from './dangerZone';
import UnassignModal from './dangerZone/UnassignModal';
import UninstallModal from './dangerZone/UninstallModal';
import {ExtensionsMenuItem, LaunchConfigMenuItem, RepoConfigMenuItem} from './options';
import ExtensionsModal from './options/ExtensionsModal';
import GitManagerModal from './options/GitModal';
import LaunchConfigModal from './options/LaunchConfigModal';
import {AutoUpdateMenuItem, CheckForUpdateMenuItem, UpdateMenuItem} from './Update';

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

  const readmeModal = useOverlayState();
  const infoModal = useOverlayState();
  const unassignModal = useOverlayState();
  const uninstallModal = useOverlayState();
  const launchConfigModal = useOverlayState();
  const extensionsModal = useOverlayState();
  const gitModal = useOverlayState();

  return (
    <>
      <Dropdown isOpen={menuIsOpen} onOpenChange={setMenuIsOpen}>
        {!updating && (
          <Button variant="tertiary" isPending={updating} isIconOnly>
            <MenuDots
              className={`size-[1.3rem] ${menuIsOpen ? 'rotate-90' : 'rotate-0'} transition-all duration-500`}
            />
          </Button>
        )}
        <Dropdown.Popover>
          <Dropdown.Menu aria-label="Card Menu" shouldCloseOnSelect={false}>
            {first.map((Comp, index) => {
              return <Comp key={index} useCardStore={useCardStore} />;
            })}
            <Dropdown.Section>
              <LaunchConfigMenuItem state={launchConfigModal} />
              <ExtensionsMenuItem state={extensionsModal} />
              <RepoConfigMenuItem state={gitModal} />
            </Dropdown.Section>

            <Separator className="bg-surface-secondary/70" />

            {second.map((Comp, index) => {
              return <Comp key={index} useCardStore={useCardStore} />;
            })}
            <Dropdown.Section>
              <UpdateMenuItem />
              <CheckForUpdateMenuItem />
              <AutoUpdateMenuItem />
            </Dropdown.Section>

            <Separator className="bg-surface-secondary/70" />

            <Dropdown.Section>
              <Dropdown.SubmenuTrigger>
                <Dropdown.Item>
                  More
                  <Dropdown.SubmenuIndicator />
                </Dropdown.Item>
                <Dropdown.Popover className="min-h-fit">
                  <Dropdown.Menu>
                    {third.map((Comp, index) => {
                      return <Comp key={index} useCardStore={useCardStore} />;
                    })}
                    <Dropdown.Section key="info">
                      <AboutMenuItem state={infoModal} />
                      <HomePageMenuItem state={readmeModal} />
                    </Dropdown.Section>

                    <Separator className="bg-surface-secondary/70" />

                    <Dropdown.Section key="card_modify">
                      <DuplicateMenuItem />
                      <UnAssignMenuItem state={unassignModal} />
                      <UninstallMenuItem state={uninstallModal} />
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

      <ReadmeModal state={readmeModal} />
      <CardInfoModal state={infoModal} />
      <UnassignModal state={unassignModal} />
      <UninstallModal state={uninstallModal} />
      <LaunchConfigModal state={launchConfigModal} />
      <ExtensionsModal state={extensionsModal} />
      <GitManagerModal state={gitModal} />
    </>
  );
});

export default InstalledMenu;
