import {Result} from 'antd';
import {isEmpty} from 'lodash';
import {memo, useState} from 'react';

import {Extension_ListData} from '../../../../../../../cross/CrossTypes';
import {PreviewBody, PreviewFooter, PreviewHeader} from './ExtensionPreview_Utils';

type Props = {
  selectedExt: Extension_ListData | undefined;
};

const ExtensionPreview = ({selectedExt}: Props) => {
  const [installed] = useState<boolean>(false);

  return (
    <div
      className={
        ' absolute right-2 inset-y-2 rounded-lg border border-foreground/10 justify-between' +
        ' overflow-hidden shadow-small bg-white dark:bg-foreground-100' +
        ' transition-[left] duration-500 sm:left-[17rem] lg:left-[21rem] 2xl:left-[25rem]'
      }>
      {isEmpty(selectedExt) ? (
        <Result
          rootClassName="size-full place-content-center"
          title="Choose an extension from the list to explore or install."
        />
      ) : (
        <>
          <PreviewHeader selectedExt={selectedExt} />
          <PreviewBody installed={installed} selectedExt={selectedExt} />
          <PreviewFooter installed={installed} updateAvailable={true} />
        </>
      )}
    </div>
  );
};
export default memo(ExtensionPreview);
