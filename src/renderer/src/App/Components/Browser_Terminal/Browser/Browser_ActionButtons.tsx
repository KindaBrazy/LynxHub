import {Button} from '@heroui/react';
import {WebviewTag} from 'electron';
import {AnimatePresence, motion, Transition, Variants} from 'framer-motion';
import {RefObject, useCallback, useEffect, useState} from 'react';

import {HomeSmile_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons2';
import {Refresh3_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons4';
import {ArrowDuo_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons5';

type Props = {webview: RefObject<WebviewTag | null>; isDomReady: boolean};

const variants: Variants = {
  animate: {scale: 1, opacity: 1},
  exit: {scale: 0.7, opacity: 0},
};
const transition: Transition = {duration: 0.3};

export default function Browser_ActionButtons({webview, isDomReady}: Props) {
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [canGoForward, setCanGoForward] = useState<boolean>(false);

  const goBack = useCallback(() => {
    webview.current?.goBack();
  }, [webview]);
  const goForward = useCallback(() => {
    webview.current?.goForward();
  }, [webview]);

  const reload = useCallback(() => {
    webview.current?.reload();
  }, [webview]);

  useEffect(() => {
    const ref = webview.current;
    if (!ref) return;

    const updateNavigationState = () => {
      if (isDomReady) {
        setCanGoBack(ref.canGoBack());
        setCanGoForward(ref.canGoForward());
      }
    };

    updateNavigationState();

    ref.addEventListener('did-navigate', updateNavigationState);
    ref.addEventListener('did-navigate-in-page', updateNavigationState);
    ref.addEventListener('did-finish-load', updateNavigationState);
    ref.addEventListener('did-stop-loading', updateNavigationState);

    return () => {
      ref.removeEventListener('did-navigate', updateNavigationState);
      ref.removeEventListener('did-navigate-in-page', updateNavigationState);
      ref.removeEventListener('did-finish-load', updateNavigationState);
      ref.removeEventListener('did-stop-loading', updateNavigationState);
    };
  }, [webview, isDomReady]);

  return (
    <div className="flex flex-row gap-x-1 mr-2 ml-1">
      <AnimatePresence>
        {canGoBack && (
          <motion.a exit="exit" initial="exit" animate="animate" variants={variants} transition={transition}>
            <Button size="sm" variant="light" onPress={goBack} className="cursor-default" isIconOnly>
              <ArrowDuo_Icon className="size-4" />
            </Button>
          </motion.a>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {canGoForward && (
          <motion.a exit="exit" initial="exit" animate="animate" variants={variants} transition={transition}>
            <Button size="sm" variant="light" onPress={goForward} className="cursor-default" isIconOnly>
              <ArrowDuo_Icon className="size-4 rotate-180" />
            </Button>
          </motion.a>
        )}
      </AnimatePresence>

      <Button size="sm" variant="light" onPress={reload} className="cursor-default" isIconOnly>
        <Refresh3_Icon className="size-4" />
      </Button>

      <Button size="sm" variant="light" className="cursor-default" isIconOnly>
        <HomeSmile_Icon className="size-4" />
      </Button>
    </div>
  );
}
