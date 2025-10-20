import {cn} from '@heroui/react';
import {AnimatePresence, motion, MotionValue, useMotionValue, useSpring, useTransform} from 'framer-motion';
import {ReactNode, useRef, useState} from 'react';

type DockItem = {
  title: string;
  icon: ReactNode;
  onClick?: () => void;
  badge?: ReactNode | boolean;
};

type Props = {
  items: DockItem[];
  className?: string;
  size?: number;
  selectedItem?: string;
};

export default function FloatingNav({items, className, size = 1, selectedItem}: Props) {
  const mouseY = useMotionValue(Infinity);

  const dockWidth = 16 * 4 * size;
  const itemGap = 4 * size;

  return (
    <motion.div
      style={{
        width: `${dockWidth}px`,
        gap: `${itemGap}px`,
      }}
      className={cn(
        'relative hidden flex-col items-center rounded-2xl bg-gray-50 px-3 py-2 ' +
          'md:flex dark:bg-LynxRaisinBlack border border-foreground-100/50 shadow-sm',
        className,
      )}
      onMouseMove={e => mouseY.set(e.pageY)}
      onMouseLeave={() => mouseY.set(Infinity)}>
      {items.map(item => (
        <IconContainer size={size} mouseY={mouseY} key={item.title} selectedItem={selectedItem} {...item} />
      ))}
    </motion.div>
  );
}

function IconContainer({
  mouseY,
  title,
  icon,
  onClick,
  badge,
  size,
  selectedItem,
}: DockItem & {mouseY: MotionValue; size: number; selectedItem?: string}) {
  const ref = useRef<HTMLDivElement>(null);
  const isSelected = title === selectedItem;

  const baseSize = 52 * size;
  const maxSize = 80 * size;
  const effectDistance = 150 * size;

  const distance = useTransform(mouseY, val => {
    const bounds = ref.current?.getBoundingClientRect() ?? {y: 0, height: 0};
    return val - bounds.y - bounds.height / 2;
  });

  const widthTransform = useTransform(distance, [-effectDistance, 0, effectDistance], [baseSize, maxSize, baseSize]);
  const heightTransform = useTransform(distance, [-effectDistance, 0, effectDistance], [baseSize, maxSize, baseSize]);

  const widthTransformIcon = useTransform(
    distance,
    [-effectDistance, 0, effectDistance],
    [baseSize * 0.5, maxSize * 0.5, baseSize * 0.5],
  );
  const heightTransformIcon = useTransform(
    distance,
    [-effectDistance, 0, effectDistance],
    [baseSize * 0.5, maxSize * 0.5, baseSize * 0.5],
  );

  const springConfig = {mass: 0.1, stiffness: 150, damping: 12};
  const width = useSpring(widthTransform, springConfig);
  const height = useSpring(heightTransform, springConfig);
  const widthIcon = useSpring(widthTransformIcon, springConfig);
  const heightIcon = useSpring(heightTransformIcon, springConfig);

  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative cursor-pointer">
      <motion.div
        ref={ref}
        onClick={onClick}
        style={{width, height}}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileTap={{scale: 0.7, transition: {duration: 0.1}}}
        className={cn('relative flex aspect-square items-center justify-center rounded-full ')}>
        {isSelected ? (
          <motion.div
            style={{borderRadius: 9999}}
            layoutId="floating-dock-indicator"
            className="absolute inset-0 rounded-full bg-primary-200"
            transition={{type: 'spring', stiffness: 350, damping: 30}}
          />
        ) : (
          <motion.div
            className={
              `absolute inset-0 rounded-full transition duration-300` +
              ` ${hovered && 'bg-white dark:bg-LynxNearBlack'}`
            }
          />
        )}

        <AnimatePresence>
          {hovered && (
            <motion.div
              className={
                'absolute left-full top-1/2 z-20 ml-4 w-fit whitespace-pre rounded-md border ' +
                'border-gray-200 bg-gray-100 px-2 py-0.5 text-xs text-neutral-700 ' +
                'dark:border-neutral-900 dark:bg-neutral-800 dark:text-white'
              }
              exit={{opacity: 0, x: -5, y: '-50%'}}
              animate={{opacity: 1, x: 0, y: '-50%'}}
              initial={{opacity: 0, x: -10, y: '-50%'}}>
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{width: widthIcon, height: heightIcon}}
          className="relative z-10 flex items-center justify-center">
          {icon}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {badge &&
          (typeof badge === 'boolean' ? (
            <motion.span
              className={
                'absolute left-1 top-1 flex size-3 rounded-full border-2' +
                ' border-gray-50 bg-success dark:border-LynxNearBlack'
              }
              key="dot-badge"
              initial={{opacity: 0, scale: 0}}
              exit={{opacity: 0, scale: 0, transition: {duration: 0.15}}}
              animate={{opacity: 1, scale: 1, transition: {type: 'spring', stiffness: 400, damping: 20}}}
            />
          ) : (
            <motion.span
              className={
                'absolute left-0 bottom-0 flex size-4 items-center justify-center rounded-full' +
                ' bg-success text-[0.6rem] text-white'
              }
              key="text-badge"
              initial={{opacity: 0, scale: 0.5}}
              exit={{opacity: 0, scale: 0.5, transition: {duration: 0.15}}}
              animate={{opacity: 1, scale: 1, transition: {type: 'spring', stiffness: 400, damping: 20}}}>
              {badge}
            </motion.span>
          ))}
      </AnimatePresence>
    </div>
  );
}
