import {Button, Dropdown, useOverlayState} from '@heroui-v3/react';
import {MenuDots} from '@solar-icons/react-perf/BoldDuotone';
import {memo} from 'react';

import {useCardStore} from '../store';
import {DuplicateMenuItem, HomePageMenuItem} from './about';
import ReadmeModal from './about/ReadmeModal';

const UninstalledMenu = memo(() => {
  const menuIsOpen = useCardStore(state => state.menuIsOpen);
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

      <ReadmeModal state={readmeModal} />
    </>
  );
});

export default UninstalledMenu;
