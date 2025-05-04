import {ReactNode, useRef, useState} from 'react';

import {useInitView, useResize} from './Components/ContextHooks';

export default function ContextMenu() {
  const [elements, setElements] = useState<ReactNode[]>([]);

  const divRef = useRef<HTMLDivElement | null>(null);

  useResize(divRef);

  useInitView(setElements);

  return (
    <div ref={divRef} className="size-fit flex flex-col w-44 dark:bg-LynxRaisinBlack bg-white">
      {...elements}
    </div>
  );
}
