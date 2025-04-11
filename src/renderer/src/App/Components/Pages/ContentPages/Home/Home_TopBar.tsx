import {Button, ButtonGroup} from '@heroui/react';
import {useDispatch} from 'react-redux';

import {Terminal_Icon, Web_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons3';
import {tabsActions} from '../../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../../Redux/Store';
import {PageID} from '../../../../Utils/Constants';

export default function Home_TopBar() {
  const dispatch = useDispatch<AppDispatch>();

  const newTerminal = () => {
    dispatch(
      tabsActions.addTab({
        id: 'tab',
        title: 'Terminal',
        isLoading: false,
        isTerminal: true,
        pageID: PageID.emptyTerminal,
        startPtyWithTabID: true,
      }),
    );
  };

  const newBrowser = () => {
    dispatch(
      tabsActions.addTab({
        id: 'tab',
        title: 'Browser',
        isLoading: false,
        isTerminal: false,
        pageID: PageID.emptyBrowser,
      }),
    );
  };

  const newTerminalBrowser = () => {
    dispatch(
      tabsActions.addTab({
        id: 'tab',
        title: 'Terminal & Browser',
        isLoading: false,
        isTerminal: true,
        pageID: PageID.emptyBrowserTerminal,
      }),
    );
  };

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
