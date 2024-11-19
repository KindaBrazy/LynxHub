import {Button, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@nextui-org/react';
import {isEmpty} from 'lodash';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {extractGitUrl} from '../../../../../cross/CrossUtils';
import {modalActions, useModalsState} from '../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../Redux/Store';
import MarkdownViewer from '../Reusable/MarkdownViewer';

export default function CardReadmeModal() {
  const {isOpen, url, title} = useModalsState('readmeModal');

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

  return (
    <Modal
      size="2xl"
      isOpen={isOpen}
      backdrop="blur"
      isDismissable={false}
      scrollBehavior="inside"
      className="max-w-[95%]"
      onOpenChange={onOpenChange}
      classNames={{backdrop: '!top-10', closeButton: 'cursor-default', wrapper: '!top-10'}}
      hideCloseButton>
      <ModalContent className="overflow-hidden">
        <ModalHeader
          className={'shrink-0 justify-center overflow-hidden bg-foreground-200 shadow-md dark:bg-foreground-100'}>
          <Link href={url} className="text-large" isExternal>
            {title}
          </Link>
        </ModalHeader>
        <ModalBody className="p-0">
          {!isEmpty(url) && (
            <MarkdownViewer rounded={false} repoPath={`${extractGitUrl(url).owner}/${extractGitUrl(url).repo}`} />
          )}
        </ModalBody>
        <ModalFooter className="border-t border-foreground/10 bg-foreground-100">
          <Button
            onPress={() => {
              onOpenChange(false);
            }}
            radius="sm"
            color="danger"
            variant="faded"
            fullWidth>
            <span className="font-semibold">Close</span>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
