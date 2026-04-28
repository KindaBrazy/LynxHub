import {ReactNode} from 'react';

/**
 * Container component that provides a full-screen, dark-themed, centered layout.
 * It also enables window dragging.
 */
export default function Container({children, className}: {children: ReactNode; className?: string}) {
  return (
    <div
      className={
        `dark absolute inset-0 flex flex-col items-center justify-center overflow-hidden` +
        ` draggable bg-LynxRaisinBlack ${className}`
      }>
      {children}
    </div>
  );
}
