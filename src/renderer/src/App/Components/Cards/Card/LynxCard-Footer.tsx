import {Button, CardFooter} from '@nextui-org/react';
import {observer} from 'mobx-react-lite';
import {useCallback, useMemo} from 'react';

import {getIconByName} from '../../../../assets/icons/SvgIconsContainer';
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
            <ReplaceMenu />
          ) : (
            <CardMenu />
          )
        ) : (
          <Button
            radius="sm"
            variant="faded"
            onPress={openDoc}
            className="cursor-default"
            size={compactMode ? 'sm' : 'md'}
            startContent={getIconByName('Document', {className: `size-full ${compactMode ? 'm-2' : 'm-2.5'}`})}
            isIconOnly
          />
        )}
      </div>
    </CardFooter>
  );
});
export default LynxCardFooter;
