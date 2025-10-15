import {ReactNode} from 'react';

export default function Container({children}: {children: ReactNode}) {
  return (
    <div
      className={
        'dark absolute inset-0 flex flex-col items-center justify-center overflow-hidden draggable bg-LynxRaisinBlack'
      }>
      {children}
    </div>
  );
}
