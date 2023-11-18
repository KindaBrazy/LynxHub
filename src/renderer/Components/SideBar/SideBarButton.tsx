/* eslint-disable jsx-a11y/img-redundant-alt */
// Import Packages
import {useContext} from 'react';
import {motion, Variants} from 'framer-motion';
// Import Components
import StatusContext, {StatusContextType} from '../GlobalStateContext';
import {getSidebarButtonId, getWhite, getWhiteFourth} from '../../../AppState/AppConstants';

type Props = {
  // Extra class names for the root element
  extraClasses?: string;
  // Button icon as img
  icon: string;
  // Button id
  btnId: string;
  // Currently selected button (id)
  selected: number;
  // Set the currently selected button (id)
  setSelected: (id: number) => void;
};

export default function SideBarButton({extraClasses, icon, btnId, selected, setSelected}: Props) {
  const {isDarkMode} = useContext(StatusContext) as StatusContextType;

  const HandleClick = () => {
    // Set currently page selected
    setSelected(getSidebarButtonId(btnId));
  };

  // Motion animation variants
  const buttonVariants: Variants = {
    hover: {
      backgroundColor: isDarkMode ? getWhite(0.1) : getWhiteFourth(),
      transition: {duration: 0.15},
    },
    tap: {
      scale: 0.8,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)',
      borderRadius: '28px',
      transition: {duration: 0.1},
    },
    active: {
      backgroundColor: isDarkMode ? getWhite(0) : getWhiteFourth(0),
      transition: {duration: 0.3},
    },
    deActive: {
      transition: {duration: 0.3},
    },
  };

  return (
    <motion.button
      id={btnId}
      type="button"
      variants={buttonVariants}
      whileTap="tap"
      whileHover="hover"
      animate={selected === getSidebarButtonId(btnId) ? 'active' : 'deActive'}
      onClick={HandleClick}
      className={['relative mt-[0.5rem] flex h-[4.4rem] w-[4.4rem] cursor-default items-center justify-center rounded-3xl', extraClasses].join(' ')}>
      {/* Button Icon */}
      <img
        src={icon}
        className={[
          selected === getSidebarButtonId(btnId) ? 'LynxBlueFilter' : 'imgDarkLightFilter',
          'pointer-events-none h-8 w-8 opacity-[85%] transition-all duration-300',
        ].join(' ')}
        alt={btnId}
      />
    </motion.button>
  );
}
SideBarButton.defaultProps = {
  extraClasses: '',
};
