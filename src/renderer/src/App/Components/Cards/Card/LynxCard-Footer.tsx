import {Button, ButtonGroup, CardFooter} from '@nextui-org/react';
import {observer} from 'mobx-react-lite';
import {useCallback} from 'react';

import {getIconByName} from '../../../../assets/icons/SvgIconsContainer';
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

  return (
    <CardFooter>
      <ButtonGroup className="mb-1" fullWidth>
        <StartButton />
        {installed ? (
          <CardMenu />
        ) : (
          <Button
            onPress={openDoc}
            className="cursor-default"
            size={compactMode ? 'sm' : 'md'}
            startContent={getIconByName('Document', {className: `size-full ${compactMode ? 'm-2' : 'm-2.5'}`})}
            isIconOnly
          />
        )}
      </ButtonGroup>
    </CardFooter>
  );
});
export default LynxCardFooter;
