import {Button, ButtonGroup} from '@heroui/react';
import {useDispatch} from 'react-redux';

import AddBreadcrumb_Renderer from '../../../../../../Breadcrumbs';
import {Terminal_Icon, Web_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {cardsActions} from '../../../../Redux/Reducer/CardsReducer';
import {useTabsState} from '../../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../../Redux/Store';

export default function Home_TopBar() {
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();

  const addRunningEmpty = (type: 'browser' | 'terminal' | 'both') =>
    dispatch(
      cardsActions.addRunningEmpty({
        tabId: activeTab,
        type,
      }),
    );

  const newTerminal = () => {
    AddBreadcrumb_Renderer(`New Empty Terminal`);
    addRunningEmpty('terminal');
  };

  const newBrowser = () => {
    AddBreadcrumb_Renderer(`New Empty Browser`);
    addRunningEmpty('browser');
  };

  const newTerminalBrowser = () => {
    AddBreadcrumb_Renderer(`New Empty Terminal & Browser`);
    addRunningEmpty('both');
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
