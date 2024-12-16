import {Link, ModalBody, Progress} from '@nextui-org/react';
import {Card, Descriptions} from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import {capitalize} from 'lodash';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {extractGitUrl} from '../../../../../../cross/CrossUtils';
import {Folder2_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons1';
import {GitHub_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons2';
import {modalActions, useModalsState} from '../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../Redux/Store';
import OpenDialog from '../../Reusable/OpenDialog';

/** Displays either a progress bar during download or an accordion with repo URL and directory selection. */
export default function InstallBody() {
  const downloading = useModalsState('installModal').downloading;
  const downloadProgress = useModalsState('installModal').downloadProgress;
  const url = useModalsState('installModal').url;
  const directory = useModalsState('installModal').directory;

  const dispatch = useDispatch<AppDispatch>();

  const setDirectory = useCallback(
    (installDirectory: string) => dispatch(modalActions.setInstallDirectory(installDirectory)),
    [dispatch],
  );

  return (
    <ModalBody className="scrollbar-hide">
      {downloading ? (
        <>
          <Progress
            color="secondary"
            value={downloadProgress.progress}
            isIndeterminate={downloadProgress.stage === 'unknown'}
            showValueLabel
          />
          <Descriptions size="small" layout="vertical">
            <DescriptionsItem label="Stage">{capitalize(downloadProgress.stage)}</DescriptionsItem>
            <DescriptionsItem label="Item">{downloadProgress.processed}</DescriptionsItem>
            <DescriptionsItem label="Total">{downloadProgress.total}</DescriptionsItem>
          </Descriptions>
        </>
      ) : (
        <div className="my-4 space-y-4">
          <Card
            title={
              <div className="flex flex-row items-center justify-between space-x-2">
                <GitHub_Icon className="size-4" />
                <span className="text-medium">Download From</span>
                <a />
              </div>
            }
            bordered={false}
            classNames={{header: ''}}
            className="text-center !shadow-small dark:bg-foreground-100">
            <Link
              href={url}
              color="foreground"
              className="transition-colors duration-300 hover:text-secondary-500"
              isExternal
              showAnchorIcon>
              {url}
            </Link>
          </Card>
          <Card
            title={
              <div className="flex flex-row items-center justify-between space-x-2">
                <Folder2_Icon className="size-4" />
                <span className="text-medium">Save to</span>
                <a />
              </div>
            }
            bordered={false}
            className="text-center !shadow-small dark:bg-foreground-100">
            <OpenDialog
              directory={directory}
              setDirectory={setDirectory}
              extraFolder={extractGitUrl(url).repo}
              dialogType={{properties: ['openDirectory']}}
            />
          </Card>
        </div>
      )}
    </ModalBody>
  );
}
