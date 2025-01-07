import {Button, CardFooter} from '@nextui-org/react';
import {observer} from 'mobx-react-lite';
import {useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {Document_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons1';
import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {modalActions} from '../../../Redux/AI/ModalsReducer';
import {useSettingsState} from '../../../Redux/App/SettingsReducer';
import {AppDispatch} from '../../../Redux/Store';
import {useCardData} from '../CardsDataManager';
import CardMenu from './Menu/CardMenu';
import StartButton from './StartButton';

const LynxCardFooter = observer(() => {
  const {installed, repoUrl, title} = useCardData();
  const compactMode = useSettingsState('cardsCompactMode');

  const dispatch = useDispatch<AppDispatch>();

  const openDoc = useCallback(() => {
    dispatch(modalActions.openReadme({url: repoUrl, title}));
  }, [dispatch, repoUrl, title]);

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
