import {AnimatePresence, Variants, motion} from 'framer-motion';
import React, {useContext, ReactElement} from 'react';
import StatusContext, {StatusContextType} from './GlobalStateContext';
import {sideBarButtonId} from '../../AppState/AppConstants';
import Sda1WebUI from './WebuiCard/WebUI/Sda1WebUI';
import SdLshWebUI from './WebuiCard/WebUI/SdLshWebUI';
import OobaboogaWebUI from './WebuiCard/WebUI/OobaboogaWebUI';
import RsxdalvWebUI from './WebuiCard/WebUI/RsxdalvWebUI';
import SettingsMenu from './WebuiCard/SettingsMenu';
import ComfyWebUI from './WebuiCard/WebUI/ComfyWebUI';
import LScrollBar from './Customizable/LScrollBar';

const pageTransitionVariants: Variants = {
  initial: {translateX: -200, opacity: 0, scale: 0.8},
  animate: {
    scale: 1,
    translateX: 0,
    opacity: 1,
    transition: {
      duration: 0.1,
      delay: 0.1,
    },
  },
  exit: {
    scale: 0.8,
    translateX: -200,
    opacity: 0,
    transition: {
      duration: 0.1,
    },
  },
};

function GetPage(pageId: number) {
  let resultElements: ReactElement;

  switch (pageId) {
    case sideBarButtonId.Image:
      resultElements = (
        <>
          {/* Automatic1111 WebUi */}
          <Sda1WebUI />
          {/* LSHQQYTIGER (DirectMl) WebUi */}
          <SdLshWebUI />
          {/* COMFYANONYMOUS WebUi */}
          <ComfyWebUI />
        </>
      );
      break;
    case sideBarButtonId.Text:
      resultElements = (
        <>
          {/* OOBABOOGA WebUi */}
          <OobaboogaWebUI />
        </>
      );
      break;
    case sideBarButtonId.Audio:
      resultElements = (
        <>
          {/* RSXDALV WebUi */}
          <RsxdalvWebUI />
        </>
      );
      break;
    case sideBarButtonId.Settings:
      return <SettingsMenu />;
    default:
      resultElements = <div />;
      break;
  }

  return (
    <LScrollBar extraClassName="pb-9">
      <motion.div className="flex w-full flex-wrap content-start" variants={pageTransitionVariants} initial="initial" animate="animate" exit="exit">
        {resultElements}
      </motion.div>
    </LScrollBar>
  );
}

export default function PageContainer() {
  const {selectedPage} = useContext(StatusContext) as StatusContextType;

  return (
    <>
      <AnimatePresence>{selectedPage === sideBarButtonId.Image && GetPage(sideBarButtonId.Image)}</AnimatePresence>
      <AnimatePresence>{selectedPage === sideBarButtonId.Text && GetPage(sideBarButtonId.Text)}</AnimatePresence>
      <AnimatePresence>{selectedPage === sideBarButtonId.Audio && GetPage(sideBarButtonId.Audio)}</AnimatePresence>
      <AnimatePresence>{selectedPage === sideBarButtonId.Settings && GetPage(sideBarButtonId.Settings)}</AnimatePresence>
    </>
  );
}
