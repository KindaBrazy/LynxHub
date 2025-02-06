import {isEmpty} from 'lodash';
import {Dispatch, memo, SetStateAction, useMemo} from 'react';

import {Extension_ListData} from '../../../../../../../cross/CrossTypes';
import {Extensions_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons1';
import {PreviewBody, PreviewFooter, PreviewHeader} from './ExtensionPreview_Utils';
import {InstalledExt} from './ExtensionsPage';

type Props = {
  selectedExt: Extension_ListData | undefined;
  installed: InstalledExt[];
  setInstalled: Dispatch<SetStateAction<InstalledExt[]>>;
};

const ExtensionPreview = ({selectedExt, installed, setInstalled}: Props) => {
  const installedExt = useMemo(() => installed.find(item => item.id === selectedExt?.id), [installed, selectedExt]);
  return (
    <div
      className={
        'absolute right-2 inset-y-2 rounded-lg justify-between overflow-hidden' +
        ' transition-[left] duration-500 sm:left-[17rem] lg:left-[21rem] 2xl:left-[25rem]'
      }>
      {isEmpty(selectedExt) ? (
        <div
          className={
            'bg-white dark:bg-LynxRaisinBlack size-full flex items-center' +
            ' justify-center gap-y-4 flex-col px-4 text-center'
          }>
          <Extensions_Icon className="size-16" />
          <span className="text-large">Select an extension from the list to begin your exploration.</span>
        </div>
      ) : (
        <>
          <PreviewHeader selectedExt={selectedExt} installedExt={installedExt} />
          <PreviewBody selectedExt={selectedExt} installed={!!installedExt} />
          <PreviewFooter selectedExt={selectedExt} installed={!!installedExt} setInstalled={setInstalled} />
        </>
      )}
    </div>
  );
};
export default memo(ExtensionPreview);
