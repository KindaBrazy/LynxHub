import {Avatar, Button, Description, Label, Link, Modal} from '@heroui-v3/react';
import {extractGitUrl, getCacheUrl} from '@lynx_common/utils';
import {isEmpty, isNil} from 'lodash';
import {Fragment, memo, useCallback, useMemo} from 'react';

import {extensionsData} from '../../../plugins/extensions/loader';
import {useModalsState} from '../../../redux/reducers/modals';
import MarkdownViewer from '../../MarkdownViewer';
import TabModal from '../../TabModal';
import {useTabModalLifecycle} from '../useTabModalManager';

type Props = {
  isOpen: boolean;
  url: string;
  title: string;
  tabID: string;
};

const CardReadmeDialog = memo(({isOpen, url, title, tabID}: Props) => {
  const {onOpenChange} = useTabModalLifecycle('readme', tabID);

  const ReplaceMd = useMemo(() => extensionsData.replaceMarkdownViewer, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, []);

  return (
    <TabModal isOpen={isOpen}>
      <Modal.Header>
        <Modal.Heading className={'justify-center overflow-hidden'}>
          <div className="inline-flex items-center gap-2">
            <Avatar>
              <Avatar.Image alt={title} src={getCacheUrl(extractGitUrl(url).avatarUrl)} />
              <Avatar.Fallback>{...title.split(' ').map(item => item.slice(0, 1).toUpperCase())}</Avatar.Fallback>
            </Avatar>
            <div className="flex flex-col">
              <Label>{title}</Label>
              <Description>
                <Link href={url} className="group no-underline hover:underline">
                  {url}
                  <Link.Icon />
                </Link>
              </Description>
            </div>
          </div>
        </Modal.Heading>
      </Modal.Header>
      <Modal.Body className="p-0">
        {!isEmpty(url) &&
          (isNil(ReplaceMd) ? (
            <MarkdownViewer url={url} rounded={false} />
          ) : (
            <ReplaceMd repoPath={url} rounded={false} />
          ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onPress={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </TabModal>
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
