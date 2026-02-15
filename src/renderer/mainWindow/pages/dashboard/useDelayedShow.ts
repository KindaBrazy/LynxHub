import {useEffect, useState} from 'react';

export function useDelayedShow(delayMs: number) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let frameId = 0;
    const timeoutId = window.setTimeout(() => {
      frameId = window.requestAnimationFrame(() => {
        setShow(true);
      });
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(frameId);
    };
  }, [delayMs]);

  return show;
}
