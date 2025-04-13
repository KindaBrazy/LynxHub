import {Button, ButtonGroup} from '@heroui/react';
import {useDispatch} from 'react-redux';

import {Terminal_Icon, Web_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons3';
import {cardsActions} from '../../../../Redux/Reducer/CardsReducer';
import {AppDispatch} from '../../../../Redux/Store';

export default function Home_TopBar() {
  const dispatch = useDispatch<AppDispatch>();

  const addRunningEmpty = (type: 'browser' | 'terminal' | 'both') =>
    dispatch(
      cardsActions.addRunningEmpty({
        tabId: 'tab',
        type,
      }),
    );

  const newTerminal = () => addRunningEmpty('terminal');

  const newBrowser = () => addRunningEmpty('browser');

  const newTerminalBrowser = () => addRunningEmpty('both');

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
