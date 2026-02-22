import {useEffect, useState} from 'react';

/**
 * A hook that returns true after a specified delay.
 * Useful for delaying the rendering of heavy components to allow initial paint.
 *
 * @param delayMs - The delay in milliseconds.
 * @returns boolean - True after the delay.
 */
export const useDelayedShow = (delayMs: number): boolean => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let frameId: number;
    const timeoutId = window.setTimeout(() => {
      // Use requestAnimationFrame to ensure the state update happens
      // in the next frame after the timeout
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
};
