import {AnimatePresence, motion} from 'framer-motion';
import {getBlack, getWhite} from '../../AppState/AppConstants';
import {useContext} from 'react';
import StatusContext, {StatusContextType} from '../Components/GlobalStateContext';

type Props = {
  ShowBlock: boolean;
};

export default function BlockBackground({ShowBlock}: Props) {
  const {isDarkMode} = useContext(StatusContext) as StatusContextType;
  return (
    <AnimatePresence>
      {ShowBlock && (
        <motion.div
          initial={{
            backgroundColor: isDarkMode ? getBlack(0) : getWhite(0),
            backdropFilter: 'blur(0px)',
          }}
          animate={{
            backgroundColor: isDarkMode ? getBlack(0.5) : getWhite(0.5),
            backdropFilter: 'blur(2px)',
          }}
          exit={{
            backgroundColor: isDarkMode ? getBlack(0) : getWhite(0),
            backdropFilter: 'blur(0px)',
          }}
          className="absolute top-10 z-40 h-full w-full bg-black"
        />
      )}
    </AnimatePresence>
  );
}
