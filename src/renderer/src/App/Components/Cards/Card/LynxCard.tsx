import {Card} from '@nextui-org/react';
import {Badge} from 'antd';
import {motion} from 'framer-motion';
import {observer} from 'mobx-react-lite';

import {useSettingsState} from '../../../Redux/App/SettingsReducer';
import {useUpdateAvailable} from '../../../Utils/UtilHooks';
import {useCardData} from '../CardsDataManager';
import LynxCardBody from './LynxCard-Body';
import LynxCardFooter from './LynxCard-Footer';
import LynxCardHeader from './LynxCard-Header';

const LynxCard = observer(() => {
  const {id} = useCardData();
  const compactMode = useSettingsState('cardsCompactMode');
  const updateAvailable = useUpdateAvailable(id);

  return (
    <Badge.Ribbon
      color="green"
      placement="end"
      text="Update Available"
      className={`z-10 ${updateAvailable ? 'opacity-100' : 'opacity-0'} transition duration-500`}>
      <motion.div
        layout="position"
        exit={{scale: 0.9, opacity: 0}}
        animate={{scale: 1, opacity: 1}}
        initial={{scale: 0.9, opacity: 0}}>
        <Card
          className={
            ` ${compactMode ? 'w-[230px]' : 'w-[277px]'} h-fit cursor-default shadow-md !transition ` +
            ` duration-300 hover:shadow-xl dark:bg-[#323232]`
          }>
          <LynxCardHeader />
          <LynxCardBody />
          <LynxCardFooter />
        </Card>
      </motion.div>
    </Badge.Ribbon>
  );
});
export default LynxCard;
