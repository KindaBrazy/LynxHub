import {extensionsData} from '@lynx/plugins/extensions/loader';
import {isEmpty, isNil} from 'lodash-es';
import {memo, useMemo} from 'react';

const classNames = 'flex size-full items-center overflow-x-scroll scrollbar-hide';

/**
 * StatusBar component displaying extension-added items at start, center, and end positions.
 * Supports container replacement via extensions.
 * Reports its height to the main process via IPC.
 */
const StatusBar = memo(() => {
  const {addEnd, addStart, addCenter, replaceContainer: ReplaceContainer} = useMemo(() => extensionsData.statusBar, []);

  const isEmptyAdd = useMemo(() => {
    return isEmpty(addStart) && isEmpty(addCenter) && isEmpty(addEnd);
  }, [addStart, addCenter, addEnd]);

  return (
    <>
      {!isNil(ReplaceContainer) ? (
        // @ts-ignore: Extension component typing is loose
        <ReplaceContainer ref={setRef} />
      ) : (
        !isEmptyAdd && (
          <div
            className={'flex h-7 w-full flex-row justify-between overflow-hidden items-center bg-surface px-3 text-sm'}>
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
