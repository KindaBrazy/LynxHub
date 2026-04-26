import {Button, Description, Modal, Spinner} from '@heroui-v3/react';

import TabModal from '../../../TabModal';
import Downloaded from './Downloaded';
import Downloading from './Downloading';
import Info from './Info';
import {useUpdateApp} from './useUpdateApp';

/** Manage updating application */
const UpdateApp = () => {
  const {
    isOpen,
    onClose,
    title,
    downloadState,
    downloadProgress,
    errorMsg,
    fetched,
    updateInfo,
    releaseNotes,
    startDownload,
    cancelDownload,
    cancel,
    openDownloadPage,
    autoDownload,
  } = useUpdateApp();

  return (
    <TabModal isOpen={isOpen} size={downloadState === undefined && fetched ? 'cover' : 'lg'}>
      <Modal.CloseTrigger onPress={onClose} />
      <Modal.Header>
        <Modal.Heading>{title}</Modal.Heading>
      </Modal.Header>
      <Modal.Body className="scrollbar-hide">
        {downloadState === 'failed' ? (
          <Downloaded success={false} cancel={cancel} onClose={onClose} errMsg={errorMsg} tryAgain={startDownload} />
        ) : downloadState === 'completed' ? (
          <Downloaded cancel={cancel} onClose={onClose} tryAgain={startDownload} success />
        ) : downloadState === 'progress' ? (
          <Downloading progress={downloadProgress} />
        ) : fetched ? (
          <Info updateInfo={updateInfo} releaseNotes={releaseNotes} />
        ) : (
          <div className="flex size-full flex-col gap-y-2 items-center my-4">
            <Spinner size="xl" />
            <Description className="text-sm">Retrieving release notes...</Description>
          </div>
        )}
      </Modal.Body>
      {downloadState !== 'completed' && downloadState !== 'failed' && (
        <Modal.Footer>
          {downloadState === undefined && (
            <Button onPress={autoDownload ? openDownloadPage : startDownload}>
              {autoDownload ? 'Download Page' : 'Download'}
            </Button>
          )}
          {downloadState === 'progress' && (
            <Button variant="danger-soft" onPress={cancelDownload}>
              Cancel
            </Button>
          )}
        </Modal.Footer>
      )}
    </TabModal>
  );
};

export default UpdateApp;
