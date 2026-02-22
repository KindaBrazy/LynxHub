import {Button, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, User} from '@heroui/react';
import {extractGitUrl, getCacheUrl} from '@lynx_common/utils';
import {isEmpty, isNil} from 'lodash';
import {Fragment, memo, useMemo} from 'react';

import {extensionsData} from '../../../plugins/extensions/loader';
import {useModalsState} from '../../../redux/reducers/modals';
import MarkdownViewer from '../../MarkdownViewer';
import {useTabModalLifecycle} from '../useTabModalManager';

type Props = {
  isOpen: boolean;
  url: string;
  title: string;
  tabID: string;
};

const CardReadmeDialog = memo(({isOpen, url, title, tabID}: Props) => {
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
      classNames={{
        backdrop: `top-10! ${show}`,
        closeButton: 'cursor-default',
        wrapper: `top-10! ${show}`,
      }}
      hideCloseButton>
      <ModalContent className="overflow-hidden">
        <ModalHeader className="shrink-0 justify-center overflow-hidden bg-foreground-200 shadow-md dark:bg-foreground-100">
          <User
            description={
              <Link size="sm" href={url} isExternal>
                {url}
              </Link>
            }
            name={title}
            avatarProps={{src: getCacheUrl(extractGitUrl(url).avatarUrl)}}
          />
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
          <Button onPress={() => onOpenChange(false)} variant="light" color="warning">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

const ReadmeModal = () => {
  const CardReadme = useMemo(() => extensionsData.replaceModals.cardReadme, []);
  const readmeModals = useModalsState('readmeModal');

  return (
    <>
      {readmeModals.map(modal => (
        <Fragment key={`${modal.tabID}_modal`}>
          {CardReadme ? <CardReadme /> : <CardReadmeDialog {...modal} />}
        </Fragment>
      ))}
    </>
  );
};

export default ReadmeModal;
