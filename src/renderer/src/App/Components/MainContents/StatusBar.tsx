import {isEmpty, isNil} from 'lodash';
import {memo, useCallback, useEffect, useMemo, useState} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import rendererIpc from '../../RendererIpc';

const classNames = 'flex size-full items-center overflow-x-scroll scrollbar-hide';

const StatusBar = memo(() => {
  const {addEnd, addStart, addCenter, replaceContainer: ReplaceContainer} = useMemo(() => extensionsData.statusBar, []);

  const isEmptyAdd = useMemo(() => {
    return isEmpty(addStart) && isEmpty(addCenter) && isEmpty(addEnd);
  }, [addStart, addCenter, addEnd]);

  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const setRef = useCallback(
    (node: HTMLDivElement) => {
      setContainerRef(node);
    },
    [setContainerRef],
  );

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        const {height} = entries[0].contentRect;
        rendererIpc.browser.addOffset('statusBar', {width: 0, height});
      }
    });

    if (containerRef) {
      observer.observe(containerRef);
    } else {
      rendererIpc.browser.addOffset('statusBar', {width: 0, height: 0});
    }

    return () => observer.disconnect();
  }, [containerRef]);

  return (
    <>
      {!isNil(ReplaceContainer) ? (
        // @ts-ignore
        <ReplaceContainer ref={setRef} />
      ) : (
        !isEmptyAdd && (
          <div
            className={
              'flex h-7 w-full flex-row justify-between overflow-hidden border-t border-foreground/10' +
              ' items-center bg-foreground-100/50 px-3 text-small dark:bg-LynxRaisinBlack/50'
            }
            ref={setRef}>
            <div className={[classNames, 'justify-start'].join(' ')}>
              {addStart.map((Start, index) => (
                <Start key={index} />
              ))}
            </div>
            <div className={[classNames, 'justify-center'].join(' ')}>
              {addCenter.map((Center, index) => (
                <Center key={index} />
              ))}
            </div>
            <div className={[classNames, 'justify-end'].join(' ')}>
              {addEnd.map((End, index) => (
                <End key={index} />
              ))}
            </div>
          </div>
        )
      )}
    </>
  );
});
export default StatusBar;
