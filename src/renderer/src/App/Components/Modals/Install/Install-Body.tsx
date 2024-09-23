import {Accordion, AccordionItem, Link, ModalBody, Progress} from '@nextui-org/react';
import {Descriptions} from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import {capitalize} from 'lodash';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {extractGitUrl} from '../../../../../../cross/CrossUtils';
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
    <ModalBody className="overflow-visible">
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
        <Accordion
          variant="splitted"
          selectionMode="multiple"
          defaultExpandedKeys={['1', '2']}
          itemClasses={{trigger: 'cursor-default'}}>
          <AccordionItem key="1" title="Download From" className="cursor-default shadow-small">
            <Link
              href={url}
              color="foreground"
              className="transition-colors duration-300 hover:text-secondary-500"
              isExternal
              showAnchorIcon>
              {url}
            </Link>
          </AccordionItem>
          <AccordionItem key="2" title="Save To" className="cursor-default shadow-small">
            <OpenDialog
              directory={directory}
              dialogType="openDirectory"
              setDirectory={setDirectory}
              extraFolder={extractGitUrl(url).repo}
            />
          </AccordionItem>
        </Accordion>
      )}
    </ModalBody>
  );
}
