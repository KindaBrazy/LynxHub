import {ButtonGroup, CardFooter} from '@heroui/react';
import {observer} from 'mobx-react-lite';
import {useMemo} from 'react';

import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {useSettingsState} from '../../../Redux/App/SettingsReducer';
import {useCardData} from '../CardsDataManager';
import CardMenu from './Menu/CardMenu';
import NotInstalled_Menu from './Menu/NotInstalled_Menu';
import StartButton from './StartButton';

const LynxCardFooter = observer(() => {
  const {installed} = useCardData();

  const cardsRepoInfo = useSettingsState('cardsRepoInfo');

  const ReplaceMenu = useMemo(() => extensionsData.cards.customize.menu.replace, []);

  return (
    <CardFooter className={cardsRepoInfo ? '' : 'pt-1'}>
      <div className="flex w-full flex-row gap-x-3">
        <ButtonGroup fullWidth>
          <StartButton />
          {installed ? ReplaceMenu ? <ReplaceMenu context={useCardData()} /> : <CardMenu /> : <NotInstalled_Menu />}
        </ButtonGroup>
      </div>
    </CardFooter>
  );
});
export default LynxCardFooter;
