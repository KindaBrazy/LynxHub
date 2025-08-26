import {ButtonGroup, CardFooter} from '@heroui/react';
import {memo, useMemo} from 'react';

import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {useCardsState} from '../../../Redux/Reducer/CardsReducer';
import {useSettingsState} from '../../../Redux/Reducer/SettingsReducer';
import {useCardStore} from './LynxCard-Wrapper';
import CardMenu from './Menu/CardMenu';
import NotInstalled_Menu from './Menu/NotInstalled_Menu';
import StartButton from './StartButton';

const LynxCardFooter = memo(() => {
  const id = useCardStore(state => state.id);
  const installed = useCardStore(state => state.installed);

  const cardsRepoInfo = useSettingsState('cardsRepoInfo');

  const runningCard = useCardsState('runningCard');
  const isRunning = useMemo(() => runningCard.some(item => item.id === id), [runningCard, id]);

  const ReplaceMenu = useMemo(() => extensionsData.cards.customize.menu.replace, []);

  return (
    <CardFooter className={cardsRepoInfo ? '' : 'pt-1'}>
      <div className="flex w-full flex-row gap-x-3">
        <ButtonGroup fullWidth>
          <StartButton />
          {!isRunning &&
            (installed ? (
              ReplaceMenu ? (
                <ReplaceMenu useCardStore={useCardStore} />
              ) : (
                <CardMenu />
              )
            ) : (
              <NotInstalled_Menu />
            ))}
        </ButtonGroup>
      </div>
    </CardFooter>
  );
});

export default LynxCardFooter;
