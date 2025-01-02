import {Button, CardFooter} from '@nextui-org/react';
import {observer} from 'mobx-react-lite';
import {useCallback, useMemo} from 'react';

import {Document_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons1';
import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {useSettingsState} from '../../../Redux/App/SettingsReducer';
import {useCardData} from '../CardsDataManager';
import CardMenu from './Menu/CardMenu';
import StartButton from './StartButton';

const LynxCardFooter = observer(() => {
  const {installed, repoUrl} = useCardData();
  const compactMode = useSettingsState('cardsCompactMode');

  const openDoc = useCallback(() => {
    window.open(repoUrl);
  }, [repoUrl]);

  const cardsRepoInfo = useSettingsState('cardsRepoInfo');

  const ReplaceMenu = useMemo(() => extensionsData.cards.customize.menu.replace, []);

  return (
    <CardFooter className={cardsRepoInfo ? '' : 'pt-1'}>
      <div className="flex w-full flex-row gap-x-3">
        <StartButton />
        {installed ? (
          ReplaceMenu ? (
            <ReplaceMenu context={useCardData()} />
          ) : (
            <CardMenu />
          )
        ) : (
          <Button
            onPress={openDoc}
            size={compactMode ? 'sm' : 'md'}
            className="cursor-default bg-foreground-200 dark:bg-foreground-100"
            startContent={<Document_Icon className={`size-5 ${compactMode ? 'm-2' : 'm-2.5'}`} />}
            isIconOnly
          />
        )}
      </div>
    </CardFooter>
  );
});
export default LynxCardFooter;
