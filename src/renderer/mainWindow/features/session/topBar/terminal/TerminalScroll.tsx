import {Button} from '@heroui-v3/react';
import {AltArrowDown, AltArrowUp} from '@solar-icons/react-perf/Linear';
import {IDisposable} from '@xterm/xterm';
import {AnimatePresence, motion} from 'framer-motion';
import {ReactNode, RefObject, useEffect, useState} from 'react';

import LynxTooltip from '../../../../components/LynxTooltip';
import {XTermAPI} from '../../../../components/useXTerm';

type AnimProp = {
  children: ReactNode;
  show: boolean;
};
function AnimateChild({show, children}: AnimProp) {
  return (
    <AnimatePresence mode="popLayout">
      {show && (
        <motion.div
          layout={true}
          exit={{translateY: 5, opacity: 0, scale: 0.7}}
          animate={{translateY: 0, opacity: 1, scale: 1}}
          initial={{translateY: 5, opacity: 0, scale: 0.7}}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type Props = {xtermRef: RefObject<XTermAPI | null>};

export default function TerminalScroll({xtermRef}: Props) {
  const [currentScroll, setCurrentScroll] = useState<number | undefined>(undefined);
  const [baseY, setBaseY] = useState<number | undefined>(undefined);

  useEffect(() => {
    let listener: IDisposable | undefined = undefined;

    const listenForScroll = () => {
      const ref = xtermRef.current;
      if (!ref) return;
      const term = ref.terminal;
      if (!term) return;

      setCurrentScroll(term.buffer.active.viewportY);
      setBaseY(term.buffer.active.baseY);

      return term.onScroll(value => {
        setCurrentScroll(value);
        setBaseY(term.buffer.active.baseY);
      });
    };

    listener = listenForScroll();

    setTimeout(() => {
      listener = listenForScroll();
    }, 2000);

    return () => listener?.dispose();
  }, []);

  const scrollTop = () => {
    const ref = xtermRef.current;
    if (!ref) return;
    const term = ref.terminal;
    if (!term) return;

    term.scrollToTop();
  };

  const scrollBottom = () => {
    const ref = xtermRef.current;
    if (!ref) return;
    const term = ref.terminal;
    if (!term) return;

    term.scrollToBottom();
  };

  return (
    <>
      <AnimateChild show={currentScroll !== 0 && currentScroll !== undefined}>
        <LynxTooltip delay={500} content="Scroll to top">
          <Button size="sm" variant="ghost" onPress={scrollTop} isIconOnly>
            <AltArrowUp />
          </Button>
        </LynxTooltip>
      </AnimateChild>

      <AnimateChild show={currentScroll !== undefined && currentScroll < (baseY || 0)}>
        <LynxTooltip delay={500} content="Scroll to bottom">
          <Button size="sm" variant="ghost" onPress={scrollBottom} isIconOnly>
            <AltArrowDown />
          </Button>
        </LynxTooltip>
      </AnimateChild>
    </>
  );
}
