import {motion, useAnimate, useInView} from 'framer-motion';
import {useContext, useEffect} from 'react';
import {getBlack, getWhiteFifth, getWhiteFourth} from '../../../../../AppState/AppConstants';
import StatusContext, {StatusContextType} from '../../../GlobalStateContext';

type Props = {
  // Inner title name
  name: string;
  // Bring in component animation
  revealAnimation?: boolean;
};
export default function FullTitleComp({name, revealAnimation}: Props) {
  const {isDarkMode} = useContext(StatusContext) as StatusContextType;
  // Motion framer hooks
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);

  // Bring in or out animation when the element is in view
  useEffect(() => {
    if (revealAnimation) {
      if (isInView) {
        animate(scope.current, {opacity: 1, scale: 1}, {duration: 0.2});
      } else {
        animate(scope.current, {opacity: 0, scale: 0.9});
      }
    }
  }, [isInView]);

  return (
    <motion.span
      ref={scope}
      whileHover={{backgroundColor: isDarkMode ? getBlack(0.6) : getWhiteFifth()}}
      className="mt-4 w-full bg-LynxWhiteFourth py-4 text-center font-semibold text-LynxPurple shadow-xl dark:bg-black/50">
      {name}
    </motion.span>
  );
}

// Default values for props when not provided
FullTitleComp.defaultProps = {
  revealAnimation: false,
};
