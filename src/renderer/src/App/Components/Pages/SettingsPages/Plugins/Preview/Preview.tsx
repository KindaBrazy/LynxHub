import {isEmpty} from 'lodash';
import {memo, useMemo} from 'react';

import {Plugins_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {usePluginsState} from '../../../../../Redux/Reducer/PluginsReducer';
import PreviewBody from './Body';
import PreviewHeader from './Header';

const Preview = memo(() => {
  const selectedPlugin = usePluginsState('selectedPlugin');
  const installed = usePluginsState('installedList');
  const installedExt = useMemo(
    () => installed.find(item => item.id === selectedPlugin?.metadata.id),
    [installed, selectedPlugin],
  );
  return (
    <div
      className={
        'absolute right-2 inset-y-2 rounded-xl border border-foreground-100 overflow-hidden' +
        ' transition-[left] duration-500 sm:left-[26rem] lg:left-[31rem] 2xl:left-[37rem] shadow-small' +
        ' bg-white dark:bg-LynxRaisinBlack rounded-xl flex flex-col'
      }>
      {isEmpty(selectedPlugin) ? (
        <div
          className={
            'bg-white dark:bg-LynxRaisinBlack size-full flex items-center' +
            ' justify-center gap-y-4 flex-col px-4 text-center'
          }>
          <Plugins_Icon className="size-16" />
          <span className="text-large">Select a plugin from the list to begin your exploration.</span>
        </div>
      ) : (
        <>
          <PreviewHeader installedExt={installedExt} />
          <PreviewBody installed={!!installedExt} />
        </>
      )}
    </div>
  );
});

export default Preview;
