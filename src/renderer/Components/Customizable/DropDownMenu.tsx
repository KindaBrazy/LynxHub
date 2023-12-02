// Import packages
import React, {useContext, useEffect, useRef, useState} from 'react';
import {motion, Variants} from 'framer-motion';
// Import components
import {getBlack, getLynxRaisinBlack, getWhite, getWhiteSecond, getWhiteThird, RendererLogDebug} from '../../../AppState/AppConstants';
import StatusContext, {StatusContextType} from '../GlobalStateContext';
// Import Assets
import {SimpleArrow} from '../../../Assets/Icons/SvgIcons';

type Props = {
  // Dropdown id, used for show and hide dropdown when other is open or clicked anywhere
  id: string;
  // Dropdown items to show
  items: {id: string; text: string}[];
  // Extra class names for the root element
  extraClasses?: string;
  // Dropdown title or category name (Showing in left side of drop down)
  categoryText?: string;
  // Currently opened dropdown
  currentOpenDrop?: string;
  // Set whether dropdown is opened
  setCurrentOpenDrop?: React.Dispatch<React.SetStateAction<string>>;
  // Set currently selected item
  setSelectedId?: (value: string) => void;
  // Callback return categoryText, and id when any item selected
  onValueChange?: (id: string, chosen: string) => void;
  // Callback return id of clicked item
  onItemClick?: (id: string) => void;
  // Initialize dropdown default if not initialized first item be selected as default
  defaultSelectedItem?: string;
};

// Motion animation variants for items
const itemVariants: Variants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {type: 'spring', stiffness: 300, damping: 24},
  },
  closed: {
    opacity: 0,
    y: 20,
    transition: {duration: 0.2},
  },
};

// Motion animation variants for item's container
const itemsContainer: Variants = {
  initial: {
    clipPath: 'inset(0% 0% 100% 0% round 12px)',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.3,
    },
  },
  open: {
    clipPath: 'inset(0% 0% 0% 0% round 12px)',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.3,
      delayChildren: 0.1,
      staggerChildren: 0.05,
    },
  },
  closed: {
    clipPath: 'inset(0% 0% 100% 0% round 12px)',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.3,
    },
  },
};
export default function DropDownMenu({
  id,
  items,
  categoryText,
  onValueChange,
  onItemClick,
  currentOpenDrop,
  setCurrentOpenDrop,
  setSelectedId,
  extraClasses,
  defaultSelectedItem,
}: Props) {
  // Whether the mouse is hovered on dropdown or not
  const [hoverBox, setHoverBox] = useState<boolean>(false);
  // Whether the dropdown is open or not
  const [isOpen, setIsOpen] = useState(false);
  // Currently selected item
  const [selectedItem, setSelectedItem] = useState(0);
  // Root height based on selected item text length
  const [rootHeight, setRootHeight] = useState(0);

  // Reference to selected item (span element) for adjusting height of dropdown
  const selectedItemRef = useRef<HTMLSpanElement>(null);

  const {isDarkMode} = useContext(StatusContext) as StatusContextType;

  // Change hoverBox state when mouse enters and leaves the dropdown
  const onHover = () => {
    setHoverBox((prevState) => !prevState);
  };

  useEffect(() => {
    // Initialize selected item with defaultSelectedItem on startup
    if (defaultSelectedItem)
      setSelectedItem(
        Math.max(
          items.findIndex((value) => value.id === defaultSelectedItem),
          0,
        ),
      );
  }, [defaultSelectedItem]);
  useEffect(() => {
    // When the user clicks outside of dropdown close dropdown
    document.addEventListener('click', () => {
      setIsOpen(false);
    });
  }, []);

  // When the user selects an item, initialize selectedItem and call onValueChange
  useEffect(() => {
    if (setSelectedId) {
      setSelectedId(items[selectedItem].id);
    }
    if (onValueChange && categoryText) onValueChange(categoryText, items[selectedItem].id);
  }, [selectedItem]);

  // Close all other dropdowns when this component opened
  useEffect(() => {
    console.log(RendererLogDebug(`isOpen:${isOpen}`));
    if (setCurrentOpenDrop && isOpen) {
      console.log(RendererLogDebug(`Calling isOpen`));
      setCurrentOpenDrop(id);
    }
  }, [isOpen]);

  // If currently dropdown opened is not self, close self
  useEffect(() => {
    console.log(RendererLogDebug(`currentOpenDrop:${currentOpenDrop}`));
    if (currentOpenDrop !== id) {
      setIsOpen(false);
    }
  }, [currentOpenDrop]);

  // Adjust height of self based on text length
  function adjustHeight() {
    if (selectedItemRef.current && selectedItemRef.current.offsetHeight) {
      setRootHeight(selectedItemRef.current.offsetHeight + 15);
    } else {
      setRootHeight(40);
    }
  }

  useEffect(() => {
    window.addEventListener('resize', () => {
      adjustHeight();
    });
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [selectedItem]);

  // Get border color based on theme and opened
  function getBoxBorderColor() {
    if (isOpen) {
      return isDarkMode ? getWhite() : getBlack();
    }
    return isDarkMode ? getWhite(0.6) : getBlack(0.6);
  }

  // Get background color based on theme and opened
  function getBoxBackgroundColor() {
    if (isOpen) {
      return isDarkMode ? getLynxRaisinBlack(0.8) : getWhiteSecond();
    }
    return isDarkMode ? getLynxRaisinBlack(0.6) : getWhite();
  }

  return (
    <motion.nav
      animate={{height: rootHeight, transition: {duration: 0.3, ease: 'backOut'}}}
      className={[`mt-4 flex w-[95%] flex-row`, extraClasses].join(' ')}>
      {/* DropDown items category text (Left side of the dropdown) */}
      {categoryText !== undefined && (
        <div className="ml-[4px] mr-4 flex cursor-default select-none items-center whitespace-nowrap text-[16pt]">{categoryText}</div>
      )}

      {/* DropDown self container */}
      <motion.div
        onMouseEnter={onHover}
        onMouseLeave={onHover}
        onClick={(event) => {
          setIsOpen((prevState) => !prevState);
          event.stopPropagation();
        }}
        whileTap={{scale: 0.98, transition: {duration: 0.05}}}
        whileHover={{borderColor: isDarkMode ? getWhite() : getBlack(), backgroundColor: isDarkMode ? getBlack(0.5) : getWhite()}}
        animate={{
          borderColor: getBoxBorderColor(),
          backgroundColor: getBoxBackgroundColor(),
        }}
        className="w-full cursor-default select-none rounded-xl border border-black/60 bg-black/60 p-2 pl-4 outline-none dark:border-white/60">
        <motion.div className="flex h-full w-full flex-row items-center justify-between">
          {/* Selected item text */}
          <span ref={selectedItemRef} className="text-[14pt]">
            {items[selectedItem].text}
          </span>

          {/* Arrow icon on right based on open or closed dropdown */}
          <SimpleArrow
            className={`z-0 mr-0.5 h-[1.2rem] w-[1.2rem] transition duration-300 ${
              hoverBox ? 'fill-black dark:fill-white' : 'fill-black/70 dark:fill-white/70'
            } ${isOpen ? 'rotate-0' : '-rotate-180'}`}
          />
        </motion.div>

        {/* Items container */}
        <motion.ul
          variants={itemsContainer}
          initial="initial"
          animate={isOpen ? 'open' : 'closed'}
          className="relative z-10 -ml-4 -mr-[0.6rem] mt-3 select-none overflow-hidden rounded-xl border
          border-black/60 bg-white text-[13pt] dark:border-white/60 dark:bg-LynxRaisinBlack">
          <div className="mb-2 mt-2">
            {/* Items */}
            {items.map((options, index) => (
              <motion.li
                key={options.id}
                id={options.id}
                whileTap={{scale: 0.95}}
                onClick={() => {
                  if (onItemClick) onItemClick(options.id);
                  setSelectedItem(index);
                }}
                animate={{backgroundColor: isDarkMode ? 'rgb(37,37,37,0)' : 'rgb(255,255,255,0)'}}
                whileHover={{backgroundColor: isDarkMode ? getBlack(0.3) : getWhiteThird()}}
                className="mb-1 ml-2 mr-2 mt-1 rounded-xl p-2"
                variants={itemVariants}>
                {options.text}
              </motion.li>
            ))}
          </div>
        </motion.ul>
      </motion.div>
    </motion.nav>
  );
}

// Default values for props when not provided
DropDownMenu.defaultProps = {
  categoryText: undefined,
  currentOpenDrop: '',
  setCurrentOpenDrop: undefined,
  setSelectedId: undefined,
  extraClasses: undefined,
  onValueChange: null,
  onItemClick: null,
  defaultSelectedItem: undefined,
};
