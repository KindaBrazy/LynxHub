import {motion, Variants} from 'framer-motion';
import {useMemo} from 'react';

import {getIconByName, IconNameType} from '../../../assets/icons/SvgIconsContainer';
import {useAppState} from '../../Redux/App/AppReducer';
import {getColor} from '../../Utils/Constants';

type Props = {icon: IconNameType; onClick: () => void; iconClassName?: string};

export default function SmallButton({icon, onClick, iconClassName}: Props) {
  const darkMode = useAppState('darkMode');

  const variants: Variants = useMemo(() => {
    return {
      init: {scale: 0.9, opacity: 0},
      animate: {
        scale: 1,
        opacity: 1,
        backgroundColor: getColor('black', 0),
        transition: {duration: 0.5},
      },
      whileHover: {
        backgroundColor: darkMode ? getColor('white', 0.1) : getColor('black', 0.2),
        transition: {duration: 0.5},
      },
      whileTap: {
        backgroundColor: darkMode ? getColor('white', 0.3) : getColor('black', 0.4),
        borderRadius: '12px',
        scale: 0.7,
        transition: {duration: 0.1},
      },
    };
  }, [darkMode]);

  return (
    <motion.div
      initial="init"
      animate="animate"
      onClick={onClick}
      variants={variants}
      whileTap="whileTap"
      whileHover="whileHover"
      className="notDraggable group ml-2 flex w-[33px] rounded-md">
      {getIconByName(icon, {
        className: `notDraggable fill-white h-full w-full transition
         duration-300 group-hover:scale-110 ${iconClassName}`,
      })}
    </motion.div>
  );
}
