import {ButtonGroup, CardFooter} from '@heroui/react';
import {observer} from 'mobx-react-lite';
import {useMemo} from 'react';

import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {useCardsState} from '../../../Redux/Reducer/CardsReducer';
import {useSettingsState} from '../../../Redux/Reducer/SettingsReducer';
import {useCardData} from '../CardsDataManager';
import CardMenu from './Menu/CardMenu';
import NotInstalled_Menu from './Menu/NotInstalled_Menu';
import StartButton from './StartButton';

const LynxCardFooter = observer(() => {
  const {installed, id} = useCardData();

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
            (installed ? ReplaceMenu ? <ReplaceMenu context={useCardData()} /> : <CardMenu /> : <NotInstalled_Menu />)}
        </ButtonGroup>
      </div>
    </CardFooter>
  );
});
export default LynxCardFooter;
