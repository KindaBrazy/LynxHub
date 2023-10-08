// Import Packages
import React, {useContext, useEffect, useState} from 'react';
import {motion, Variants} from 'framer-motion';
// Import Components
import SideBarButton from './SideBarButton';
import StatusContext, {StatusContextType} from '../GlobalStateContext';
// Imports Assets
import ImageGenerateIcon from '../../../Assets/Icons/Category/ImageGenerate.png';

// import SettingsIcon from '../../../Assets/Icons/Category/Settings.png';

const sideBarPictureId: string = 'sideBarPicture';
// const sideBarSettingsId: string = 'sideBarSetting';

export default function SideBar() {
  const {webuiRunning} = useContext(StatusContext) as StatusContextType;

  // Current selected page
  const [currentSelected, setCurrentSelected] = useState(sideBarPictureId);
  // Whether show or hiding sideBar
  const [showSideBar, setShowSideBar] = useState(!webuiRunning);

  // When a webui is running hide the SideBar
  useEffect(() => {
    setShowSideBar(!webuiRunning);
  }, [webuiRunning]);

  // Variants for animating show and hide of the sidebar
  const motionVariants: Variants = {
    init: {
      opacity: 0,
      translateY: '-50%',
      height: '400px',
      transition: {
        duration: 0.7,
        type: 'spring',
      },
    },
    animate: {
      opacity: showSideBar ? 1 : 0,
      height: showSideBar ? 'calc(100% - 5rem)' : '200px',
      left: showSideBar ? '1.25rem' : '-100px',
      transition: {
        duration: 0.7,
        type: 'spring',
      },
    },
  };

  return (
    <motion.div
      variants={motionVariants}
      initial="init"
      animate="animate"
      className="absolute left-5 top-1/2 z-30 mt-5 flex w-[5rem] flex-col items-center
      justify-between rounded-[1.25rem] bg-white shadow-SideBar dark:bg-[#292929]">
      {/* Button -> Ai collections of image generate */}
      <div className="flex flex-col">
        <SideBarButton selected={currentSelected} setSelected={setCurrentSelected} btnId={sideBarPictureId} icon={ImageGenerateIcon} />
      </div>

      {/* Button -> App Settings 
      <div className="flex flex-col">
        <span className="sideBarSeperator h-[0.11rem] w-full" />
        <SideBarButton
          selected={currentSelected}
          setSelected={setCurrentSelected}
          btnId={sideBarSettingsId}
          extraClasses="mb-2"
          icon={SettingsIcon}
        />
      </div> */}
    </motion.div>
  );
}
