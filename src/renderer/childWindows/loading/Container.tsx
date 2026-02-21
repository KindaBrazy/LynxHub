import {ReactNode} from 'react';

/**
 * Container component that provides a full-screen, dark-themed, centered layout.
 * It also enables window dragging.
 */
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
