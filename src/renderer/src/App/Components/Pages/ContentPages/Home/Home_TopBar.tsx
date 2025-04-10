import {Button, ButtonGroup} from '@heroui/react';

import {Terminal_Icon, Web_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons3';

export default function Home_TopBar() {
  const newTerminal = () => {};
  const newBrowser = () => {};
  const newTerminalBrowser = () => {};

  return (
    <div className="w-full shrink-0 flex flex-row gap-x-2 px-4 justify-end">
      <ButtonGroup size="sm">
        <Button onPress={newTerminal} startContent={<Terminal_Icon />}>
          Terminal
        </Button>
        <Button onPress={newBrowser} startContent={<Web_Icon />}>
          Browser
        </Button>
        <Button
          startContent={
            <div>
              <Terminal_Icon />
              <Web_Icon />
            </div>
          }
          color="primary"
          onPress={newTerminalBrowser}
          isIconOnly
        />
      </ButtonGroup>
    </div>
  );
}
