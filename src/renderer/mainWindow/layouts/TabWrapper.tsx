import {ReactNode} from 'react';

import useInertRemover from '../utils/useInertRemover';

type Props = {children: ReactNode; tabID: string; isActive: boolean};

export default function TabWrapper({children, tabID, isActive}: Props) {
  const onRef = useInertRemover();

  return (
    <div
      ref={onRef}
      id={`${tabID}_wrapper`}
      style={{transform: 'translate(0)'}}
      className={`${isActive ? 'flex flex-row' : 'hidden'} size-full overflow-hidden`}>
      {children}
    </div>
  );
}
