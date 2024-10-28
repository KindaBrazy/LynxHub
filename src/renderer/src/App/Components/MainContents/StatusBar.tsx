import {isEmpty} from 'lodash';
import {memo} from 'react';

import {useExtensions} from '../../Extensions/ExtensionsContext';

const classNames = 'flex size-full items-center overflow-x-scroll scrollbar-hide';

const StatusBar = () => {
  const {statusBar} = useExtensions();

  return (
    <>
      {!isEmpty(statusBar?.Container)
        ? statusBar.Container(statusBar?.add)
        : !isEmpty(statusBar?.add) && (
            <div
              className={
                'flex h-7 w-full flex-row justify-between overflow-hidden border-t border-foreground/10' +
                ' items-center bg-foreground-100/50 px-3 text-small dark:bg-LynxRaisinBlack/50'
              }>
              <div className={[classNames, 'justify-start'].join(' ')}>
                {statusBar?.add?.start.map((Start, index) => <Start key={index} />)}
              </div>
              <div className={[classNames, 'justify-center'].join(' ')}>
                {statusBar?.add?.center.map((Center, index) => <Center key={index} className="shrink-0" />)}
              </div>
              <div className={[classNames, 'justify-end'].join(' ')}>
                {statusBar?.add?.end.map((End, index) => <End key={index} />)}
              </div>
            </div>
          )}
    </>
  );
};
export default memo(StatusBar);
