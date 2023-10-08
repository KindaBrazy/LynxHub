import {motion, Variants} from 'framer-motion';
import React, {useContext} from 'react';
import StatusContext, {StatusContextType} from '../GlobalStateContext';

type Props = {
  // Extra class names for the root element
  extraClasses?: string;
};
export default function WebViewBrowser({extraClasses}: Props) {
  const {webuiLaunch} = useContext(StatusContext) as StatusContextType;

  // Motion animation variants
  const variants: Variants = {
    initial: {
      translateY: 'calc(-100% - 50px)',
      opacity: 0,
    },
    animate: {
      translateY: webuiLaunch.currentView === 'webView' ? '0' : 'calc(-100% - 10px)',
      opacity: webuiLaunch.currentView === 'webView' ? 1 : 0,
      transition: {duration: 0.7, type: 'spring'},
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      className={['absolute inset-2 overflow-hidden rounded-xl bg-blue-600/0', extraClasses].join(' ')}>
      <webview ref={webuiLaunch.webViewRef} className="absolute h-full w-full" src={webuiLaunch.currentAddress} title="WebUi" />
    </motion.div>
  );
}
WebViewBrowser.defaultProps = {
  extraClasses: '',
};
