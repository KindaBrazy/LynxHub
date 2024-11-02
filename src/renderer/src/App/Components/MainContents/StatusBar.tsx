import {isEmpty} from 'lodash';
import {memo, useMemo, useState} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';

const classNames = 'flex size-full items-center overflow-x-scroll scrollbar-hide';

const StatusBar = () => {
  const [statusBar] = useState(extensionsData.statusBar);

  const isEmptyAdd = useMemo(() => {
    return isEmpty(statusBar.addStart) && isEmpty(statusBar.addCenter) && isEmpty(statusBar.addEnd);
  }, [statusBar]);

  return (
    <>
      {!isEmpty(statusBar.replaceContainer)
        ? statusBar.replaceContainer
        : !isEmptyAdd && (
            <div
              className={
                'flex h-7 w-full flex-row justify-between overflow-hidden border-t border-foreground/10' +
                ' items-center bg-foreground-100/50 px-3 text-small dark:bg-LynxRaisinBlack/50'
              }>
              <div className={[classNames, 'justify-start'].join(' ')}>
                {statusBar.addStart.map((Start, index) => (
                  <Start key={index} />
                ))}
              </div>
              <div className={[classNames, 'justify-center'].join(' ')}>
                {statusBar.addCenter.map((Center, index) => (
                  <Center key={index} />
                ))}
              </div>
              <div className={[classNames, 'justify-end'].join(' ')}>
                {statusBar.addEnd.map((End, index) => (
                  <End key={index} />
                ))}
              </div>
            </div>
          )}
    </>
  );
};
export default memo(StatusBar);
