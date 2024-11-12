import {Card} from '@nextui-org/react';
import {Badge} from 'antd';
import {motion} from 'framer-motion';
import {observer} from 'mobx-react-lite';
import {useMemo} from 'react';

import {getIconByName} from '../../../../assets/icons/SvgIconsContainer';
import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {useCardsState} from '../../../Redux/AI/CardsReducer';
import {useAppState} from '../../../Redux/App/AppReducer';
import {useSettingsState} from '../../../Redux/App/SettingsReducer';
import {useUpdateAvailable} from '../../../Utils/UtilHooks';
import {useCardData} from '../CardsDataManager';
import LynxCardBody from './LynxCard-Body';
import LynxCardFooter from './LynxCard-Footer';
import LynxCardHeader from './LynxCard-Header';

const LynxCard = observer(() => {
  const {id, installed} = useCardData();
  const compactMode = useSettingsState('cardsCompactMode');
  const cardsRepoInfo = useSettingsState('cardsRepoInfo');
  const updateAvailable = useUpdateAvailable(id);
  const pinnedCards = useCardsState('pinnedCards');
  const darkMode = useAppState('darkMode');

  const isPinned = useMemo(() => {
    return pinnedCards.includes(id);
  }, [pinnedCards]);

  const {header: Header, body: Body, footer: Footer} = useMemo(() => extensionsData.cards.customize, []);

  return (
    <Badge.Ribbon
      className={`z-10 ${
        updateAvailable && installed ? 'block opacity-100' : 'hidden opacity-0'
      } transition duration-500`}
      color="green"
      placement="end"
      text="Update Available">
      <Badge.Ribbon
        placement="start"
        color={darkMode ? '#AA00FF' : '#d500f9'}
        text={getIconByName('Pin', {className: 'm-1'})}
        className={`z-10 ${isPinned ? 'block opacity-100' : 'hidden opacity-0'} transition duration-500`}>
        <motion.div
          layout="position"
          layoutId={`${id}_card`}
          exit={{scale: 0.9, opacity: 0}}
          animate={{scale: 1, opacity: 1}}
          initial={{scale: 0.9, opacity: 0}}>
          <Card
            className={
              ` ${compactMode ? 'w-[230px]' : 'w-[277px]'} h-fit cursor-default shadow-md !transition ` +
              ` border-1 border-foreground/10 duration-300 hover:shadow-xl dark:bg-[#3d3d3d]`
            }>
            {Header ? <Header /> : <LynxCardHeader />}
            {!compactMode && cardsRepoInfo && Body ? <Body /> : <LynxCardBody />}
            {Footer ? <Footer /> : <LynxCardFooter />}
          </Card>
        </motion.div>
      </Badge.Ribbon>
    </Badge.Ribbon>
  );
});
export default LynxCard;
