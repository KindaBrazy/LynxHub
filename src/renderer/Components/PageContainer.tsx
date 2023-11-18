import {AnimatePresence, motion, Variants} from 'framer-motion';
import React, {useContext, ReactElement} from 'react';
import StatusContext, {StatusContextType} from './GlobalStateContext';
import {sideBarButtonId} from '../../AppState/AppConstants';
import Sda1WebUi from './WebuiCard/WebUI/Sda1WebUi';
import SdLshWebUi from './WebuiCard/WebUI/SdLshWebUi';
import OOBABOOGAWebUI from './WebuiCard/WebUI/OOBABOOGAWebUI';
import RSXDALVWebUI from './WebuiCard/WebUI/RSXDALVWebUI';

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

const getPage = (pageId: number) => {
  let resultElements: ReactElement;
  switch (pageId) {
    case sideBarButtonId.Image:
      resultElements = (
        <>
          {/* Automatic1111 WebUi */}
          <Sda1WebUi />
          {/* LSHQQYTIGER (DirectMl) WebUi */}
          <SdLshWebUi />
        </>
      );
      break;
    case sideBarButtonId.Text:
      resultElements = (
        <>
          {/* OOBABOOGA WebUi */}
          <OOBABOOGAWebUI />
        </>
      );
      break;
    case sideBarButtonId.Audio:
      resultElements = (
        <>
          {/* RSXDALV WebUi */}
          <RSXDALVWebUI />
        </>
      );
      break;
    default:
      resultElements = <div />;
      break;
  }

  return (
    <motion.div
      className="absolute flex h-full w-full flex-wrap content-start opacity-0"
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit">
      {resultElements}
    </motion.div>
  );
};

export default function PageContainer() {
  const {selectedPage} = useContext(StatusContext) as StatusContextType;

  return (
    <>
      <AnimatePresence>{selectedPage === sideBarButtonId.Image && getPage(sideBarButtonId.Image)}</AnimatePresence>
      <AnimatePresence>{selectedPage === sideBarButtonId.Text && getPage(sideBarButtonId.Text)}</AnimatePresence>
      <AnimatePresence>{selectedPage === sideBarButtonId.Audio && getPage(sideBarButtonId.Audio)}</AnimatePresence>
    </>
  );
}
