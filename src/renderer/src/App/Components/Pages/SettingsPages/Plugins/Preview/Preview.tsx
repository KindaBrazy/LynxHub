import {isEmpty} from 'lodash';
import {Dispatch, memo, SetStateAction, useMemo} from 'react';

import {InstalledPlugin, PluginAvailableItem} from '../../../../../../../../cross/plugin/PluginTypes';
import {Plugins_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import PreviewBody from './Body';
import PreviewHeader from './Header';

type Props = {
  selectedExt: PluginAvailableItem | undefined;
  installed: InstalledPlugin[];
  setInstalled: Dispatch<SetStateAction<InstalledPlugin[]>>;
};

const Preview = memo(({selectedExt, installed, setInstalled}: Props) => {
  const installedExt = useMemo(
    () => installed.find(item => item.metadata.id === selectedExt?.metadata.id),
    [installed, selectedExt],
  );
  return (
    <div
      className={
        'absolute right-2 inset-y-2 rounded-xl border border-foreground-100 overflow-hidden' +
        ' transition-[left] duration-500 sm:left-[26rem] lg:left-[31rem] 2xl:left-[37rem] shadow-small' +
        'bg-white dark:bg-LynxRaisinBlack rounded-xl flex flex-col'
      }>
      {isEmpty(selectedExt) ? (
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
          <PreviewHeader selectedExt={selectedExt} installedExt={installedExt} setInstalled={setInstalled} />
          <PreviewBody selectedExt={selectedExt} installed={!!installedExt} />
        </>
      )}
    </div>
  );
});

export default Preview;
