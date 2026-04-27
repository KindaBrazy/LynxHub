import {Button, Dropdown, useOverlayState} from '@heroui-v3/react';
import {MenuDots} from '@solar-icons/react-perf/BoldDuotone';
import {memo} from 'react';

import ReadmeModal from '../../modals/ReadmeModal';
import {useCardStore} from '../store';
import {DuplicateMenuItem, HomePageMenuItem} from './about';

const UninstalledMenu = memo(() => {
  const menuIsOpen = useCardStore(state => state.menuIsOpen);
  const title = useCardStore(state => state.title);
  const url = useCardStore(state => state.repoUrl);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);

  const readmeModal = useOverlayState();

  return (
    <>
      <Dropdown isOpen={menuIsOpen} onOpenChange={setMenuIsOpen}>
        <Button variant="tertiary" isIconOnly>
          <MenuDots className={`size-[1.3rem] ${menuIsOpen ? 'rotate-90' : 'rotate-0'} transition-all duration-500`} />
        </Button>
        <Dropdown.Popover>
          <Dropdown.Menu aria-label="Card Menu">
            <Dropdown.Section>
              <HomePageMenuItem state={readmeModal} />
              <DuplicateMenuItem />
            </Dropdown.Section>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>

      <ReadmeModal url={url} title={title} state={readmeModal} />
    </>
  );
});

export default UninstalledMenu;
