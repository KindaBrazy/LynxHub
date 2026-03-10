import {Button, Tooltip} from '@heroui/react';
import {AltArrowDown, AltArrowUp} from '@solar-icons/react-perf/Bold';
import {AnimatePresence, motion} from 'framer-motion';
import {ReactNode, RefObject, useEffect, useState} from 'react';

import {XTermAPI} from '../../../../components/useXTerm';

type AnimProp = {
  children: ReactNode;
  show: boolean;
};
function AnimateChild({show, children}: AnimProp) {
  return (
    <AnimatePresence>
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
    const ref = xtermRef.current;
    if (!ref) return;
    const term = ref.terminal;
    if (!term) return;

    const listener = term.onScroll(value => {
      setCurrentScroll(value);
      setBaseY(term.buffer.active.baseY);
    });

    return () => listener.dispose();
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
        <Tooltip delay={500} content="Scroll to top">
          <Button size="sm" variant="light" onPress={scrollTop} isIconOnly>
            <AltArrowUp size={20} />
          </Button>
        </Tooltip>
      </AnimateChild>

      <AnimateChild show={currentScroll !== undefined && currentScroll < (baseY || 0)}>
        <Tooltip delay={500} content="Scroll to bottom">
          <Button size="sm" variant="light" onPress={scrollBottom} isIconOnly>
            <AltArrowDown size={20} />
          </Button>
        </Tooltip>
      </AnimateChild>
    </>
  );
}
