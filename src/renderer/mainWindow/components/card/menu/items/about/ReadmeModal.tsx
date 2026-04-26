import {Avatar, Description, Label, Link, Modal, UseOverlayStateReturn} from '@heroui-v3/react';
import {extractGitUrl, getCacheUrl} from '@lynx_common/utils';
import {isEmpty, isNil} from 'lodash';
import {memo, useMemo} from 'react';

import {extensionsData} from '../../../../../plugins/extensions/loader';
import MarkdownViewer from '../../../../MarkdownViewer';
import TabModal from '../../../../TabModal';
import {useCardStore} from '../../../store';

type Props = {
  state: UseOverlayStateReturn;
};

const CardReadmeDialog = memo(({state}: Props) => {
  const ReplaceMd = useMemo(() => extensionsData.replaceMarkdownViewer, []);

  const repoUrl = useCardStore(state => state.repoUrl);
  const title = useCardStore(state => state.title);

  return (
    <TabModal isOpen={state.isOpen}>
      <Modal.CloseTrigger onPress={state.close} />
      <Modal.Header>
        <Modal.Heading className={'justify-center overflow-hidden'}>
          <div className="inline-flex items-center gap-2">
            <Avatar>
              <Avatar.Image alt={title} src={getCacheUrl(extractGitUrl(repoUrl).avatarUrl)} />
              <Avatar.Fallback>{...title.split(' ').map(item => item.slice(0, 1).toUpperCase())}</Avatar.Fallback>
            </Avatar>
            <div className="flex flex-col">
              <Label>{title}</Label>
              <Description>
                <Link href={repoUrl} className="group no-underline hover:underline">
                  {repoUrl}
                  <Link.Icon />
                </Link>
              </Description>
            </div>
          </div>
        </Modal.Heading>
      </Modal.Header>
      <Modal.Body className="p-0">
        {!isEmpty(repoUrl) &&
          (isNil(ReplaceMd) ? (
            <MarkdownViewer url={repoUrl} rounded={false} />
          ) : (
            <ReplaceMd rounded={false} repoPath={repoUrl} />
          ))}
      </Modal.Body>
    </TabModal>
  );
});

const ReadmeModal = (props: Props) => {
  const CardReadme = useMemo(() => extensionsData.replaceModals.cardReadme, []);

  return CardReadme ? <CardReadme /> : <CardReadmeDialog {...props} />;
};

export default ReadmeModal;
