import {Button, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/react';
import {isEmpty, isNil} from 'lodash';
import {useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import {modalActions, useModalsState} from '../../Redux/Reducer/ModalsReducer';
import {useTabsState} from '../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../Redux/Store';
import MarkdownViewer from '../Reusable/MarkdownViewer';

const CardReadmeModal = () => {
  const {isOpen, url, title, tabID} = useModalsState('readmeModal');
  const activeTab = useTabsState('activeTab');

  const dispatch = useDispatch<AppDispatch>();

  const onOpenChange = useCallback(
    (isOpen: boolean) =>
      dispatch(
        modalActions.setIsOpen({
          isOpen,
          modalName: 'readmeModal',
        }),
      ),
    [dispatch],
  );

  const ReplaceMd = useMemo(() => extensionsData.replaceMarkdownViewer, []);
  const show = useMemo(() => (activeTab === tabID ? 'flex' : 'hidden'), [activeTab, tabID]);
  return (
    <Modal
      size="2xl"
      isOpen={isOpen}
      backdrop="blur"
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
              <MarkdownViewer repoUrl={url} rounded={false} />
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
            color="warning"
            className="cursor-default">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CardReadmeModal;
