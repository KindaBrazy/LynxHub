import {Card} from '@heroui/react';
import {Badge} from 'antd';
import {motion} from 'framer-motion';
import {observer} from 'mobx-react-lite';
import {useMemo} from 'react';

import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {useCardsState} from '../../../Redux/Reducer/CardsReducer';
import {useSettingsState} from '../../../Redux/Reducer/SettingsReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {useUpdateAvailable} from '../../../Utils/UtilHooks';
import {useCardData} from '../CardsDataManager';
import LynxCardBody from './LynxCard-Body';
import LynxCardFooter from './LynxCard-Footer';
import LynxCardHeader from './LynxCard-Header';

const LynxCard = observer(() => {
  const activeTab = useTabsState('activeTab');
  const {id, installed} = useCardData();
  const compactMode = useSettingsState('cardsCompactMode');
  const cardsRepoInfo = useSettingsState('cardsRepoInfo');
  const updateAvailable = useUpdateAvailable(id);

  const runningCard = useCardsState('runningCard');
  const isRunning = useMemo(() => runningCard.some(item => item.id === id), [runningCard, id]);

  const {header: Header, body: Body, footer: Footer} = useMemo(() => extensionsData.cards.customize, []);

  return (
    <Badge.Ribbon
      className={`z-10 ${
        updateAvailable && installed && !isRunning ? 'block opacity-100' : 'hidden opacity-0'
      } transition duration-500`}
      color="green"
      placement="end"
      text="Update Available">
      <motion.div
        layout="position"
        exit={{opacity: 0, scale: 0.95}}
        animate={{opacity: 1, scale: 1}}
        initial={{opacity: 0, scale: 0.95}}
        layoutId={`${activeTab}_${id}_card`}>
        <Card
          className={
            ` ${compactMode ? 'w-[230px]' : 'w-[277px]'} h-fit cursor-default shadow-md !transition ` +
            ` duration-300 hover:shadow-xl dark:bg-[#3a3a3a]`
          }>
          {Header ? <Header context={useCardData()} /> : <LynxCardHeader />}
          {!compactMode && cardsRepoInfo && (Body ? <Body context={useCardData()} /> : <LynxCardBody />)}
          {Footer ? <Footer context={useCardData()} /> : <LynxCardFooter />}
        </Card>
      </motion.div>
    </Badge.Ribbon>
  );
});
export default LynxCard;
