import {ReactNode, useRef, useState} from 'react';

import {useContextMenuSetup, useResize} from './Components/ContextHooks';

export default function ContextMenu() {
  const [elements, setElements] = useState<ReactNode[]>([]);
  const [widthSize, setWidthSize] = useState<'sm' | 'md' | 'lg'>('sm');

  const divRef = useRef<HTMLDivElement | null>(null);

  useResize(divRef);

  useContextMenuSetup(setElements, setWidthSize);

  return (
    <div
      className={
        `size-fit flex flex-col dark:bg-LynxRaisinBlack bg-white ` +
        ` ${widthSize === 'sm' ? 'w-44' : widthSize === 'md' ? 'w-72' : 'w-96'}`
      }
      ref={divRef}>
      {...elements}
    </div>
  );
}
