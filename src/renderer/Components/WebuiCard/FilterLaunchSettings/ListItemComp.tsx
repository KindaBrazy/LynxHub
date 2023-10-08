// Import packages
import React, {useContext, useLayoutEffect} from 'react';
import {motion, useAnimate, useInView} from 'framer-motion';
// Import components
import LCheckBox from '../../Customizable/LCheckBox';
// Import modules
import {getBlack, getWhiteThird} from '../../../../AppState/AppConstants';
import StatusContext, {StatusContextType} from '../../GlobalStateContext';

type Props = {
  // Item name or title
  name: string;
  defaultEnabled: boolean;
  // Item description
  description: string;
  // On check and uncheck value change
  onValueChange?: (name: {id: string; value: string}, enabled: boolean) => void;
};

function ListItemComp({name, defaultEnabled, description, onValueChange}: Props) {
  const {isDarkMode} = useContext(StatusContext) as StatusContextType;

  // Framer motion hooks
  const [scope, animate] = useAnimate();
  const inView = useInView(scope);

  // Animate item when it's in view change
  useLayoutEffect(() => {
    if (inView) {
      animate(scope.current, {borderRadius: '1rem', opacity: 1, y: 0, scale: 1}, {duration: 0.2, ease: 'backOut'});
    } else {
      animate(scope.current, {borderRadius: '7rem', opacity: 0, y: 50, scale: 0.7});
    }
  }, [inView]);

  return (
    <motion.div
      whileHover={{backgroundColor: isDarkMode ? getBlack(0.3) : getWhiteThird()}}
      ref={scope}
      className="mt-5 flex w-[90%] flex-col items-center justify-center bg-LynxWhiteSecond px-4 py-2 pb-4 dark:bg-black/20">
      <LCheckBox onValueChange={onValueChange} name={name} defaultEnabled={defaultEnabled} extraClasses="!font-medium" />
      <span className="flex text-xl text-black/60 dark:text-white/60">{description}</span>
    </motion.div>
  );
}

// Default values for props when not provided
ListItemComp.defaultProps = {
  onValueChange: undefined,
};

export default React.memo(ListItemComp);
