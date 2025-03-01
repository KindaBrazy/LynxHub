import {Badge} from 'antd';
import {motion} from 'framer-motion';
import {ReactNode, useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {appActions, useAppState} from '../../Redux/Reducer/AppReducer';
import {tabsActions, useActivePage} from '../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../Redux/Store';
import {getColor} from '../../Utils/Constants';
import LynxTooltip from '../Reusable/LynxTooltip';

const HOVER_OPACITY: number = 0.05;
const TAP_OPACITY: number = 0.15;

const INDICATOR_STYLE = {
  background: 'bg-primary',
  borderRadius: 'rounded-r-full',
  height: 'h-[15px]',
  width: 'w-[3px]',
};

type Props = {
  children?: ReactNode;
  title?: string;
  badge?: boolean;
  pageId: string;
};

/** Navigation button */
export default function NavButton({children, pageId, title, badge}: Props) {
  const darkMode = useAppState('darkMode');
  const activePage = useActivePage();
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();

  // const navigate = useNavigate();

  useEffect(() => {
    setIsSelected(activePage === pageId);
    if (activePage === pageId) {
      setTimeout(() => {
        dispatch(appActions.setAppTitle(title?.replace(' Generation', '')));
      }, 50);
    }
  }, [activePage, pageId]);

  const handleClick = useCallback(() => {
    if (activePage === pageId) return;
    dispatch(tabsActions.setActivePage({pageID: pageId, title: title || '', isTerminal: false}));
  }, [activePage, pageId, dispatch]);

  const getBackgroundColor = useCallback(
    (state: 'hover' | 'tap') => {
      return darkMode
        ? getColor('white', state === 'hover' ? HOVER_OPACITY : TAP_OPACITY)
        : getColor('black', state === 'hover' ? HOVER_OPACITY : TAP_OPACITY);
    },
    [darkMode],
  );

  return (
    <LynxTooltip delay={350} content={title} placement="right" isEssential>
      <div className="flex flex-row items-center">
        {isSelected && (
          <motion.div
            className={
              `absolute ${INDICATOR_STYLE.height} ${INDICATOR_STYLE.width} ` +
              ` ${INDICATOR_STYLE.borderRadius} ${INDICATOR_STYLE.background}`
            }
            layoutId="indicator"
            transition={{bounce: 0.2, duration: 0.4, type: 'spring'}}
          />
        )}
        <motion.div
          animate={{
            backgroundColor: getColor('transparent'),
            borderRadius: '0.75rem',
            transition: {duration: 0.3},
          }}
          whileTap={{
            backgroundColor: getBackgroundColor('tap'),
            borderRadius: '1.2rem',
            scale: 0.7,
            transition: {duration: 0.1},
          }}
          onClick={handleClick}
          className="group mx-1.5 flex w-full rounded-xl p-2.5 outline-none"
          whileHover={{backgroundColor: getBackgroundColor('hover'), transition: {duration: 0.3}}}>
          <Badge dot={badge} status="processing" color={getColor('success')} classNames={{root: 'size-full'}}>
            <div
              className={`transition duration-300 group-hover:scale-110 ${
                isSelected ? 'opacity-100 group-hover:opacity-100' : 'opacity-40 group-hover:opacity-60'
              }`}>
              {children}
            </div>
          </Badge>
        </motion.div>
      </div>
    </LynxTooltip>
  );
}
