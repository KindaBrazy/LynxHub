import {Card} from '@heroui/react';
import {Badge} from 'antd';
import {motion} from 'framer-motion';
import {observer} from 'mobx-react-lite';
import {useMemo} from 'react';

import {extensionsData} from '../../../Extensions/ExtensionLoader';
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

  const {header: Header, body: Body, footer: Footer} = useMemo(() => extensionsData.cards.customize, []);

  return (
    <Badge.Ribbon
      className={`z-10 ${
        updateAvailable && installed ? 'block opacity-100' : 'hidden opacity-0'
      } transition duration-500`}
      color="green"
      placement="end"
      text="Update Available">
      <motion.div
        layout="position"
        exit={{opacity: 0}}
        animate={{opacity: 1}}
        initial={{opacity: 0}}
        layoutId={`${id}_card`}>
        <Card
          className={
            ` ${compactMode ? 'w-[230px]' : 'w-[277px]'} h-fit cursor-default shadow-md !transition ` +
            ` border-1 border-foreground/10 duration-300 hover:shadow-xl dark:bg-[#3d3d3d]`
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
