import {Button, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/react';
import {isEmpty, isNil} from 'lodash';
import {Fragment, useMemo} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import {useModalsState} from '../../Redux/Reducer/ModalsReducer';
import MarkdownViewer from '../Reusable/MarkdownViewer';
import {useTabModalLifecycle} from './useTabModalManager';

type Props = {isOpen: boolean; url: string; title: string; tabID: string};

const CardReadmeModal = ({isOpen, url, title, tabID}: Props) => {
  const {onOpenChange, show} = useTabModalLifecycle('readme', tabID);

  const ReplaceMd = useMemo(() => extensionsData.replaceMarkdownViewer, []);

  return (
    <Modal
      size="2xl"
      isOpen={isOpen}
      backdrop="blur"
      placement="center"
      isDismissable={false}
      scrollBehavior="inside"
      className="max-w-[95%]"
      onOpenChange={onOpenChange}
      classNames={{backdrop: `!top-10 ${show}`, closeButton: 'cursor-default', wrapper: `!top-10 ${show}`}}
      hideCloseButton>
      <ModalContent className="overflow-hidden">
        <ModalHeader
          className={'shrink-0 justify-center overflow-hidden bg-foreground-200 shadow-md dark:bg-foreground-100'}>
          <Link href={url} className="text-large" isExternal>
            {title}
          </Link>
        </ModalHeader>
        <ModalBody className="p-0">
          {!isEmpty(url) &&
            (isNil(ReplaceMd) ? (
              <MarkdownViewer url={url} rounded={false} />
            ) : (
              <ReplaceMd repoPath={url} rounded={false} />
            ))}
        </ModalBody>
        <ModalFooter>
          <Button
            onPress={() => {
              onOpenChange(false);
            }}
            variant="light"
            color="warning">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const ReadMeModal = () => {
  const CardReadme = useMemo(() => extensionsData.replaceModals.cardReadme, []);

  const readmeModals = useModalsState('readmeModal');

  return (
    <>
      {readmeModals.map(modal => (
        <Fragment key={`${modal.tabID}_modal`}>{CardReadme ? <CardReadme /> : <CardReadmeModal {...modal} />}</Fragment>
      ))}
    </>
  );
};

export default ReadMeModal;
