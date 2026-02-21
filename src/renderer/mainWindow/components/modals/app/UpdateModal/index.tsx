import {Button, CircularProgress, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/react';
import {modalMotionProps} from '../../../../utils/constants';
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
    show,
  } = useUpdateApp();

  return (
    <Modal
      size="lg"
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      isDismissable={false}
      scrollBehavior="inside"
      motionProps={modalMotionProps}
      classNames={{backdrop: `top-10! ${show}`, wrapper: `top-10! scrollbar-hide ${show}`}}
      hideCloseButton
    >
      <ModalContent>
        <ModalHeader className="text-success">{title}</ModalHeader>
        <ModalBody className="items-center pb-5 scrollbar-hide">
          {downloadState === 'failed' ? (
            <Downloaded success={false} cancel={cancel} onClose={onClose} errMsg={errorMsg} tryAgain={startDownload} />
          ) : downloadState === 'completed' ? (
            <Downloaded cancel={cancel} onClose={onClose} tryAgain={startDownload} success />
          ) : downloadState === 'progress' ? (
            <Downloading progress={downloadProgress} />
          ) : fetched ? (
            <Info releaseNotes={releaseNotes} updateInfo={updateInfo} />
          ) : (
            <CircularProgress size="lg" color="secondary" label="Retrieving Release Notes..." />
          )}
        </ModalBody>
        {downloadState !== 'completed' && downloadState !== 'failed' && (
          <ModalFooter>
            {downloadState === undefined && (
              <Button
                color="success"
                variant="light"
                className="cursor-default"
                onPress={autoDownload ? openDownloadPage : startDownload}
              >
                {autoDownload ? 'Download Page' : 'Download'}
              </Button>
            )}
            {downloadState === 'progress' && (
              <Button color="warning" variant="light" onPress={cancelDownload} className="cursor-default">
                Cancel
              </Button>
            )}
            <Button color="danger" variant="light" onPress={onClose} className="cursor-default">
              Close
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default UpdateApp;
