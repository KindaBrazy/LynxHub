import {Result} from 'antd';
import {isEmpty} from 'lodash';
import {Dispatch, memo, SetStateAction, useMemo} from 'react';

import {Extension_ListData} from '../../../../../../../cross/CrossTypes';
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
        <Result
          rootClassName="size-full place-content-center"
          title="Choose an extension from the list to explore or install."
        />
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
