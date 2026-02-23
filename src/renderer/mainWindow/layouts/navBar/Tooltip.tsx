import {AnimatePresence, motion} from 'framer-motion';
import {ReactNode, RefObject, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

type PortalTooltipContentProps = {
  content: string;
  position: {top: number; left: number};
  isDark: boolean;
  tooltipRef: RefObject<HTMLDivElement | null>;
};

/**
 * Portal component for rendering the tooltip content outside the DOM hierarchy.
 */
const PortalTooltipContent = ({content, position, isDark, tooltipRef}: PortalTooltipContentProps) => {
  const textColor = isDark ? '#e5e7eb' : '#1f2937';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const bgColor = isDark ? '#2d2d32' : '#ffffff';

  return createPortal(
    <motion.div
      style={{
        top: position.top,
        left: position.left,
        position: 'fixed',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
      ref={tooltipRef}
      exit={{opacity: 0, x: -10}}
      animate={{opacity: 1, x: 0}}
      transition={{duration: 0.2}}
      initial={{opacity: 0, x: -10}}>
      <div
        style={{
          backgroundColor: bgColor,
          color: textColor,
          border: `1px solid ${borderColor}`,
        }}
        className="px-3 py-2 rounded-xl shadow-xl whitespace-nowrap text-sm font-medium relative">
        {content}
        <div
          style={{
            borderRightColor: bgColor,
          }}
          className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent"
        />
      </div>
    </motion.div>,
    document.body,
  );
};

export type TooltipProps = {
  children: ReactNode;
  content: string;
  isDark: boolean;
};

/**
 * Tooltip component that renders content in a portal on hover.
 */
const Tooltip = ({children, content, isDark}: TooltipProps) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({top: 0, left: 0});

  useLayoutEffect(() => {
    if (isHovered && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
      const left = triggerRect.right + 12;
      setPosition({top, left});
    }
  }, [isHovered]);

  return (
    <>
      <div ref={triggerRef} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        {children}
      </div>

      <AnimatePresence>
        {isHovered && (
          <PortalTooltipContent isDark={isDark} content={content} position={position} tooltipRef={tooltipRef} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Tooltip;
